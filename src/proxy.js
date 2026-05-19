import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { proxy as legacyProxy } from "./dashboardGuard";
import { getUserById } from "./lib/saas/userRepo.js";

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (user?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

export async function proxy(request, event) {
  if (isPublicLlmApi(request.nextUrl.pathname)) {
    return legacyProxy(request);
  }
  return hasClerkConfig ? clerkProxyHandler(request, event) : legacyProxy(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
