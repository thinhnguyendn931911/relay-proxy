import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/db/driver.js";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getAdapter();

  const sub = await db.get(
    `SELECT s.*, p.slug AS plan_slug, p.display_name AS plan_display_name,
            p.monthly_token_cap, p.rpm_limit, p.price_cents, p.allowed_model_patterns
     FROM saas_subscriptions s
     JOIN saas_plans p ON p.id = s.plan_id
     WHERE s.user_id = ? AND s.status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!sub) {
    return NextResponse.json({ subscription: null, plan: null, usage: null });
  }

  const now = new Date();
  const periodKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const period = await db.get(
    `SELECT prompt_tokens, completion_tokens, requests FROM saas_usage_periods WHERE user_id = ? AND period_yyyymm = ?`,
    [userId, periodKey]
  );

  const totalTokensUsed = Number(period?.prompt_tokens ?? 0) + Number(period?.completion_tokens ?? 0);

  return NextResponse.json({
    subscription: {
      id: sub.id,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      stripeCustomerId: sub.stripe_customer_id,
    },
    plan: {
      slug: sub.plan_slug,
      displayName: sub.plan_display_name,
      monthlyTokenCap: Number(sub.monthly_token_cap),
      rpmLimit: Number(sub.rpm_limit),
      priceCents: Number(sub.price_cents),
      allowedModelPatterns: typeof sub.allowed_model_patterns === "string"
        ? JSON.parse(sub.allowed_model_patterns)
        : sub.allowed_model_patterns || [],
    },
    usage: {
      totalTokensUsed,
      requests: Number(period?.requests ?? 0),
    },
  });
}
