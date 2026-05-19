import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  nextResponse: Symbol("next"),
  legacyResponse: Symbol("legacy"),
  jsonResponse: vi.fn((body, init) => ({
    status: init?.status || 200,
    body,
  })),
  legacyProxy: vi.fn(() => Symbol("legacy")),
  getUserById: vi.fn(),
  redirectToSignIn: vi.fn(() => ({ status: 302, location: "/sign-in" })),
  authState: { userId: "user_1", sessionClaims: { email: "op@example.com" } },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: vi.fn(() => mocks.nextResponse),
    json: mocks.jsonResponse,
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler) => (request, event) =>
    handler(() => Promise.resolve({
      ...mocks.authState,
      redirectToSignIn: mocks.redirectToSignIn,
    }), request, event)
  ),
  createRouteMatcher: vi.fn((patterns) => (request) => {
    const pathname = request.nextUrl.pathname;
    return patterns.some((pattern) => {
      const prefix = pattern.replace("(.*)", "");
      return pathname === prefix || pathname.startsWith(prefix);
    });
  }),
}));

vi.mock("../../src/dashboardGuard.js", () => ({
  proxy: mocks.legacyProxy,
}));

vi.mock("../../src/lib/saas/userRepo.js", () => ({
  getUserById: mocks.getUserById,
}));

process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test";
process.env.CLERK_SECRET_KEY = "sk_test";

const { proxy } = await import("../../src/proxy.js");

function request(pathname) {
  return {
    nextUrl: { pathname },
    headers: new Headers({ host: "localhost:20129" }),
    cookies: { get: vi.fn(() => undefined) },
    url: `http://localhost:20129${pathname}`,
  };
}

describe("Clerk proxy API routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authState = { userId: "user_1", sessionClaims: { email: "op@example.com" } };
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: true });
    mocks.legacyProxy.mockReturnValue(mocks.legacyResponse);
  });

  it("allows Clerk operator access to dashboard APIs", async () => {
    const response = await proxy(request("/api/combos"));

    expect(response).toBeUndefined();
    expect(mocks.getUserById).toHaveBeenCalledWith("user_1");
    expect(mocks.legacyProxy).not.toHaveBeenCalled();
  });

  it("allows admin access to dashboard pages", async () => {
    const response = await proxy(request("/dashboard/providers"));

    expect(response).toBeUndefined();
    expect(mocks.getUserById).toHaveBeenCalledWith("user_1");
  });

  it("rejects user-role access to dashboard pages", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: false });

    const response = await proxy(request("/dashboard/providers"));

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
  });

  it("rejects missing SaaS rows for Clerk-protected app pages", async () => {
    mocks.getUserById.mockResolvedValue(null);

    const response = await proxy(request("/app/keys"));

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
  });

  it("allows user-role access to SaaS app pages", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: false });

    const response = await proxy(request("/app/keys"));

    expect(response).toBeUndefined();
  });

  it("rejects user-role access to operator APIs", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: false });

    const response = await proxy(request("/api/providers"));

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
  });

  it("does not treat user SaaS self-service APIs as operator APIs", async () => {
    const response = await proxy(request("/api/saas/keys"));

    expect(response).toBeUndefined();
    expect(mocks.getUserById).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated dashboard API access", async () => {
    mocks.authState = { userId: null, sessionClaims: {} };

    const response = await proxy(request("/api/combos"));

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Unauthorized");
  });

  it("keeps public LLM APIs on legacy tenant API-key handling", async () => {
    const response = await proxy(request("/v1/chat/completions"));

    expect(response).toBe(mocks.legacyResponse);
    expect(mocks.legacyProxy).toHaveBeenCalled();
    expect(mocks.getUserById).not.toHaveBeenCalled();
  });
});
