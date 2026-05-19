import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { proxy as legacyProxy } from "./dashboardGuard";
import { getUserById, createOrUpdateUser } from "./lib/saas/userRepo.js";

const isClerkProtectedRoute = createRouteMatcher(["/app(.*)", "/dashboard(.*)"]);
const isClerkAwareRoute = createRouteMatcher(["/app(.*)", "/dashboard(.*)", "/api/saas(.*)", "/api/stripe(.*)"]);
const hasClerkConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

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

  if (isClerkAwareRoute(request)) {
    return;
  }

  return legacyProxy(request);
}

export const proxy = hasClerkConfig ? clerkMiddleware(clerkProxy) : legacyProxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
