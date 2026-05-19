import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { proxy as legacyProxy } from "./dashboardGuard";
import { getUserById, createOrUpdateUser } from "./lib/saas/userRepo.js";
import { ensureTrialSubscription } from "./lib/saas/subscriptionRepo.js";

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
  "/api/media-providers(.*)",
  "/api/pricing(.*)",
  "/api/tags(.*)",
  "/api/cli-tools(.*)",
  "/api/translator(.*)",
]);
const PUBLIC_LLM_PREFIXES = ["/v1", "/v1beta", "/api/v1", "/api/v1beta"];
const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

function isPublicLlmApi(pathname) {
  return PUBLIC_LLM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function ensureUser(authState) {
  let user = await getUserById(authState.userId);
  if (!user) {
    const claims = authState.sessionClaims || {};
    const email =
      claims.email ||
      claims.email_address ||
      claims.primary_email_address ||
      (claims.email_addresses && claims.email_addresses[0]) ||
      `${authState.userId}@clerk`;
    user = await createOrUpdateUser({ id: authState.userId, email });
    await ensureTrialSubscription(user.id);
  }
  return user;
}

async function clerkProxy(auth, request) {
  if (request.nextUrl.pathname.startsWith("/api/saas/clerk-webhook")) {
    return NextResponse.next();
  }

  if (isClerkProtectedRoute(request)) {
    const authState = await auth();
    if (!authState.userId) return authState.redirectToSignIn();

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const user = await ensureUser(authState);
      if (!user?.isOperator) {
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

    const user = await ensureUser(authState);
    if (!user?.isOperator) {
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
