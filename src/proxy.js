import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { proxy as legacyProxy } from "./dashboardGuard";
import { getUserById } from "./lib/saas/userRepo.js";
import { checkRateLimit } from "./lib/rateLimit.js";

const isClerkProtectedRoute = createRouteMatcher(["/app(.*)", "/dashboard(.*)"]);
const isClerkAwareRoute = createRouteMatcher(["/app(.*)", "/dashboard(.*)", "/api/saas(.*)", "/api/stripe(.*)"]);
const isOperatorApiRoute = createRouteMatcher([
  "/api/settings(.*)",
  "/api/keys(.*)",
  "/api/providers(.*)",
  "/api/provider-nodes(.*)",
  "/api/proxy-pools(.*)",
  "/api/combos(.*)",
  "/api/models(.*)",
  "/api/usage(.*)",
  "/api/oauth(.*)",
  "/api/cloud(.*)",
  "/api/media-providers(.*)",
  "/api/pricing(.*)",
  "/api/tags(.*)",
  "/api/cli-tools(.*)",
  "/api/mcp(.*)",
  "/api/translator(.*)",
  "/api/tunnel(.*)",
  "/api/saas/users(.*)",
  "/api/saas/plans(.*)",
  "/api/saas/usage-aggregate(.*)",
]);
const PUBLIC_LLM_PREFIXES = ["/v1", "/v1beta", "/api/v1", "/api/v1beta"];
const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

function isPublicLlmApi(pathname) {
  return PUBLIC_LLM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isApiRoute(pathname) {
  return pathname.startsWith("/api/") || PUBLIC_LLM_PREFIXES.some((p) => pathname.startsWith(p));
}

async function getRoleUser(authState) {
  const user = await getUserById(authState.userId);
  if (!user) return null;
  return {
    ...user,
    role: user.isOperator ? "admin" : "user",
  };
}

async function clerkProxy(auth, request) {
  if (request.nextUrl.pathname.startsWith("/api/saas/clerk-webhook")) {
    return NextResponse.next();
  }

  if (isClerkProtectedRoute(request)) {
    const authState = await auth();
    if (!authState.userId) return authState.redirectToSignIn();

    const user = await getRoleUser(authState);

    if (!user) {
      if (isApiRoute(request.nextUrl.pathname)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (user?.role !== "admin") {
        return NextResponse.redirect(new URL("/forbidden", request.url));
      }
    }

    return;
  }

  if (isOperatorApiRoute(request)) {
    const authState = await auth();
    if (!authState.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getRoleUser(authState);
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return;
  }

  if (isClerkAwareRoute(request)) {
    return;
  }

  return legacyProxy(request);
}

const clerkProxyHandler = clerkMiddleware(clerkProxy);

const RATE_LIMITED_PATHS = ["/api/auth/login", "/sign-in", "/sign-up", "/api/saas/clerk-webhook", "/api/stripe/webhook"];

function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.ip
    || "unknown";
}

export async function proxy(request, event) {
  const { pathname } = request.nextUrl;

  if (RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    const ip = getClientIp(request);
    const { allowed, retryAfter } = checkRateLimit(`ip:${ip}:${pathname}`, { maxRequests: 30, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
  }

  if (isPublicLlmApi(pathname)) {
    return legacyProxy(request);
  }
  return hasClerkConfig ? clerkProxyHandler(request, event) : legacyProxy(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
