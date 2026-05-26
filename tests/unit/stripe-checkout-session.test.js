import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getAdapter: vi.fn(),
  StripeCheckout: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("../../src/lib/db/driver.js", () => ({
  getAdapter: mocks.getAdapter,
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    constructor(key) {
      this.key = key;
      return mocks.StripeCheckout(key);
    }
  },
}));

const { POST } = await import("../../src/app/api/stripe/checkout-session/route.js");

describe("POST /api/stripe/checkout-session", () => {
  let originalEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PAID_PRICE_ID = "price_test_123";
    mocks.auth.mockResolvedValue({ userId: "user_1" });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 401 when not authenticated", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 503 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toBe("Stripe is not configured");
  });

  it("returns 404 when no paid plan exists", async () => {
    mocks.getAdapter.mockResolvedValue({
      get: vi.fn().mockResolvedValue(null),
    });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("No paid plan available");
  });

  it("returns 503 when stripe_price_id and env var are both empty", async () => {
    delete process.env.STRIPE_PAID_PRICE_ID;
    mocks.getAdapter.mockResolvedValue({
      get: vi.fn().mockResolvedValue({ slug: "paid", stripe_price_id: null }),
    });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toBe("Stripe price not configured");
  });

  it("creates a checkout session and returns the URL", async () => {
    mocks.getAdapter.mockResolvedValue({
      get: vi.fn().mockResolvedValue({ slug: "paid", stripe_price_id: "price_from_db" }),
    });
    mocks.StripeCheckout.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/session_123" }),
        },
      },
    });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe("https://checkout.stripe.com/session_123");
  });

  it("falls back to STRIPE_PAID_PRICE_ID env var when plan has no stripe_price_id", async () => {
    mocks.getAdapter.mockResolvedValue({
      get: vi.fn().mockResolvedValue({ slug: "paid", stripe_price_id: null }),
    });
    const createMock = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/ok" });
    mocks.StripeCheckout.mockReturnValue({
      checkout: { sessions: { create: createMock } },
    });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_test_123", quantity: 1 }],
      })
    );
  });

  it("returns 500 with generic message when Stripe throws", async () => {
    mocks.getAdapter.mockResolvedValue({
      get: vi.fn().mockResolvedValue({ slug: "paid", stripe_price_id: "price_x" }),
    });
    mocks.StripeCheckout.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockRejectedValue(new Error("Invalid API key")),
        },
      },
    });

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Payment service error");
    expect(body.error).not.toContain("API key");
  });

  it("returns 500 when auth() throws", async () => {
    mocks.auth.mockRejectedValue(new Error("Clerk outage"));

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Payment service error");
  });
});
