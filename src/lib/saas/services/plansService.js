import {
  getCurrentPlanForUser,
  getPlanById,
  listPlans,
  updatePlanById,
} from "@/lib/saas/data/plansData.js";
import { currentPeriod, getUsagePeriod } from "@/lib/saas/data/usageData.js";

export async function listOperatorPlans() {
  return { plans: await listPlans() };
}

export async function updateOperatorPlan(planId, body) {
  const existing = await getPlanById(planId);
  if (!existing) return { error: "Plan not found", status: 404 };

  const { updated, hadUpdates } = await updatePlanById(planId, body);
  if (!hadUpdates) return { error: "No fields to update", status: 400 };

  return { plan: updated };
}

export async function getUserCurrentPlan(userId) {
  const sub = await getCurrentPlanForUser(userId);
  if (!sub) return { subscription: null, plan: null, usage: null };

  const period = await getUsagePeriod(userId, currentPeriod().key);
  const totalTokensUsed = Number(period?.prompt_tokens ?? 0) + Number(period?.completion_tokens ?? 0);

  return {
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
  };
}
