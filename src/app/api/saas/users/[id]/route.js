import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import { getAdapter } from "@/lib/db/driver.js";

export async function GET(_request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const { id } = await params;
  const db = await getAdapter();

  const user = await db.get(`SELECT * FROM saas_users WHERE id = ?`, [id]);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const subscription = await db.get(
    `SELECT s.*, p.display_name AS plan_name, p.slug AS plan_slug
     FROM saas_subscriptions s
     JOIN saas_plans p ON p.id = s.plan_id
     WHERE s.user_id = ? AND s.status IN ('trialing','active','past_due','canceled','expired')
     ORDER BY s.created_at DESC LIMIT 1`,
    [id]
  );

  const now = new Date();
  const periodKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const usage = await db.get(
    `SELECT prompt_tokens, completion_tokens, requests FROM saas_usage_periods WHERE user_id = ? AND period_yyyymm = ?`,
    [id, periodKey]
  );

  const keyCount = await db.get(
    `SELECT COUNT(*) AS total FROM apiKeys WHERE userid = ? AND revokedat IS NULL`,
    [id]
  );

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      isOperator: user.is_operator === true || user.is_operator === 1,
      createdAt: user.created_at,
    },
    subscription: subscription
      ? {
          id: subscription.id,
          planId: subscription.plan_id,
          planName: subscription.plan_name,
          planSlug: subscription.plan_slug,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          stripeCustomerId: subscription.stripe_customer_id,
        }
      : null,
    usage: {
      promptTokens: Number(usage?.prompt_tokens ?? 0),
      completionTokens: Number(usage?.completion_tokens ?? 0),
      requests: Number(usage?.requests ?? 0),
    },
    activeKeys: Number(keyCount?.total ?? 0),
  });
}

export async function PATCH(request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const { id } = await params;
  const body = await request.json();
  const db = await getAdapter();

  const user = await db.get(`SELECT * FROM saas_users WHERE id = ?`, [id]);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (body.action === "suspend") {
    await db.run(`UPDATE saas_users SET status = 'suspended', updated_at = NOW() WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true, status: "suspended" });
  }

  if (body.action === "reactivate") {
    await db.run(`UPDATE saas_users SET status = 'active', updated_at = NOW() WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true, status: "active" });
  }

  if (body.action === "override_plan" && body.planId) {
    const plan = await db.get(`SELECT * FROM saas_plans WHERE id = ?`, [body.planId]);
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 400 });

    await db.run(
      `UPDATE saas_subscriptions SET plan_id = ?, updated_at = NOW()
       WHERE user_id = ? AND status IN ('trialing','active','past_due')`,
      [body.planId, id]
    );
    return NextResponse.json({ ok: true, planId: body.planId });
  }

  if (body.action === "reset_trial") {
    const trialPlan = await db.get(`SELECT * FROM saas_plans WHERE id = 'plan_free_trial'`);
    if (!trialPlan) return NextResponse.json({ error: "Trial plan not found" }, { status: 500 });

    const trialDays = Number(trialPlan.trial_days || 14);

    await db.run(
      `UPDATE saas_subscriptions SET status = 'expired', updated_at = NOW()
       WHERE user_id = ? AND status IN ('trialing','active','past_due')`,
      [id]
    );

    const { randomUUID } = await import("node:crypto");
    await db.run(
      `INSERT INTO saas_subscriptions
         (id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES (?, ?, 'plan_free_trial', 'trialing', NOW(), NOW() + (?::text || ' days')::interval, NOW(), NOW())`,
      [randomUUID(), id, trialDays]
    );
    return NextResponse.json({ ok: true, action: "trial_reset" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
