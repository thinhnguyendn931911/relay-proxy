import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("../../src/lib/saas/userRepo.js", () => ({
  getUserById: mocks.getUserById,
}));

const { requireSaasUser, requireOperator } = await import("../../src/lib/saas/routeAuth.js");

describe("SaaS route auth roles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = "sk_test";
    mocks.auth.mockResolvedValue({ userId: "user_1" });
  });

  afterEach(() => {
    delete process.env.CLERK_SECRET_KEY;
  });

  it("resolves admin role from operator users", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: true });

    const result = await requireOperator();

    expect(result.ok).toBe(true);
    expect(result.user.role).toBe("admin");
  });

  it("resolves user role from non-operator users", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: false });

    const result = await requireSaasUser();

    expect(result.ok).toBe(true);
    expect(result.user.role).toBe("user");
  });

  it("returns 401 without Clerk authentication", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const result = await requireSaasUser();

    expect(result).toEqual({ ok: false, status: 401, error: "Unauthorized" });
  });

  it("returns 403 when the SaaS user row is missing", async () => {
    mocks.getUserById.mockResolvedValue(null);

    const result = await requireSaasUser();

    expect(result).toEqual({ ok: false, status: 403, error: "Forbidden" });
  });

  it("returns 403 when user role calls an admin-only route", async () => {
    mocks.getUserById.mockResolvedValue({ id: "user_1", isOperator: false });

    const result = await requireOperator();

    expect(result).toEqual({ ok: false, status: 403, error: "Forbidden" });
  });

  it("preserves legacy operator access when Clerk is disabled", async () => {
    delete process.env.CLERK_SECRET_KEY;

    const result = await requireOperator();

    expect(result).toEqual({ ok: true, legacy: true });
    expect(mocks.auth).not.toHaveBeenCalled();
  });
});
