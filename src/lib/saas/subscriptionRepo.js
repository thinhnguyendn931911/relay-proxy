import { randomUUID } from "node:crypto";
import { getAdapter } from "@/lib/db/driver.js";

function normalizeSubscription(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveSubscriptionForUser(userId) {
  const db = await getAdapter();
  return normalizeSubscription(await db.get(
    `SELECT * FROM saas_subscriptions
     WHERE user_id = ? AND status IN ('trialing', 'active', 'past_due')
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  ));
}

export async function getSubscriptionByStripeId(stripeSubscriptionId) {
  const db = await getAdapter();
  return normalizeSubscription(await db.get(
    `SELECT * FROM saas_subscriptions WHERE stripe_subscription_id = ?`,
    [stripeSubscriptionId]
  ));
}

export async function upgradeToPaid(userId, stripeSubscriptionId, stripeCustomerId) {
  const db = await getAdapter();
  const plan = await db.get(`SELECT * FROM saas_plans WHERE slug = 'paid' AND is_active = true`);
  if (!plan) throw new Error("Paid plan not found");

  await db.run(
    `UPDATE saas_subscriptions SET status = 'expired', updated_at = NOW()
     WHERE user_id = ? AND status IN ('trialing','active','past_due')`,
    [userId]
  );

  const row = await db.get(
    `INSERT INTO saas_subscriptions
       (id, user_id, plan_id, status, current_period_start, current_period_end,
        stripe_customer_id, stripe_subscription_id, created_at, updated_at)
     VALUES (?, ?, ?, 'active', NOW(), NOW() + '30 days'::interval, ?, ?, NOW(), NOW())
     RETURNING *`,
    [randomUUID(), userId, plan.id, stripeCustomerId, stripeSubscriptionId]
  );
  return normalizeSubscription(row);
}

export async function syncSubscriptionPeriod(stripeSubscriptionId, status, periodStart, periodEnd) {
  const db = await getAdapter();
  return normalizeSubscription(await db.get(
    `UPDATE saas_subscriptions
     SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = NOW()
     WHERE stripe_subscription_id = ?
     RETURNING *`,
    [status, periodStart, periodEnd, stripeSubscriptionId]
  ));
}

export async function markCanceled(stripeSubscriptionId) {
  const db = await getAdapter();
  return normalizeSubscription(await db.get(
    `UPDATE saas_subscriptions SET status = 'canceled', updated_at = NOW()
     WHERE stripe_subscription_id = ?
     RETURNING *`,
    [stripeSubscriptionId]
  ));
}

export async function markPastDue(stripeSubscriptionId) {
  const db = await getAdapter();
  return normalizeSubscription(await db.get(
    `UPDATE saas_subscriptions SET status = 'past_due', updated_at = NOW()
     WHERE stripe_subscription_id = ?
     RETURNING *`,
    [stripeSubscriptionId]
  ));
}

export async function ensureTrialSubscription(userId) {
  const db = await getAdapter();
  const existing = await getActiveSubscriptionForUser(userId);
  if (existing) return existing;

  const plan = await db.get(`SELECT * FROM saas_plans WHERE id = 'plan_free_trial'`);
  if (!plan) throw new Error("Free trial plan not found");

  const trialDays = Number(plan.trial_days || 14);
  const row = await db.get(
    `INSERT INTO saas_subscriptions
       (id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
     VALUES (?, ?, ?, 'trialing', NOW(), NOW() + (?::text || ' days')::interval, NOW(), NOW())
     RETURNING *`,
    [randomUUID(), userId, plan.id, trialDays]
  );
  return normalizeSubscription(row);
}
