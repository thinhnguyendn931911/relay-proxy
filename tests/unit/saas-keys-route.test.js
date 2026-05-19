import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  jsonResponse: vi.fn((body, init) => ({
    status: init?.status || 200,
    body,
  })),
  requireSaasUser: vi.fn(),
  listKeysForUser: vi.fn(),
  createUserApiKey: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonResponse,
  },
}));

vi.mock("../../src/lib/saas/routeAuth.js", () => ({
  requireSaasUser: mocks.requireSaasUser,
}));

vi.mock("../../src/lib/localDb.js", () => ({
  listKeysForUser: mocks.listKeysForUser,
  createUserApiKey: mocks.createUserApiKey,
}));

const keysRoute = await import("../../src/app/api/saas/keys/route.js");

describe("SaaS keys route scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSaasUser.mockResolvedValue({
      ok: true,
      user: { id: "user_1", role: "user", isOperator: false },
    });
  });

  it("lists keys for the authenticated SaaS user only", async () => {
    mocks.listKeysForUser.mockResolvedValue([{ id: "key_1" }]);

    const response = await keysRoute.GET();

    expect(response.body.keys).toEqual([{ id: "key_1" }]);
    expect(mocks.listKeysForUser).toHaveBeenCalledWith("user_1");
  });

  it("creates keys for the authenticated SaaS user only", async () => {
    mocks.createUserApiKey.mockResolvedValue({ id: "key_1", key: "sk_user_test" });
    const request = { json: vi.fn().mockResolvedValue({ name: "Default" }) };

    const response = await keysRoute.POST(request);

    expect(response.status).toBe(201);
    expect(mocks.createUserApiKey).toHaveBeenCalledWith({
      userId: "user_1",
      name: "Default",
    });
  });

  it("denies requests when no SaaS user role is available", async () => {
    mocks.requireSaasUser.mockResolvedValue({ ok: false, status: 403, error: "Forbidden" });

    const response = await keysRoute.GET();

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
    expect(mocks.listKeysForUser).not.toHaveBeenCalled();
  });
});
