import {
  getUserByIdRaw,
  getUserDetails,
  listUsers,
  overrideUserPlan,
  reactivateUser,
  resetUserTrial,
  setUserOperator,
  suspendUser,
} from "@/lib/saas/data/userAdminData.js";
import { currentPeriod } from "@/lib/saas/data/usageData.js";

export async function listOperatorUsers({ status, search, page }) {
  const limit = 50;
  const offset = (page - 1) * limit;
  const data = await listUsers({ status, search, limit, offset });

  return {
    users: data.users.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      isOperator: u.is_operator === true || u.is_operator === 1,
      createdAt: u.created_at,
      planId: u.plan_id,
      planName: u.plan_name,
      subscriptionStatus: u.sub_status,
    })),
    total: data.total,
    page,
    pages: Math.ceil(data.total / limit),
  };
}

export async function getOperatorUser(userId) {
  const data = await getUserDetails(userId, currentPeriod().key);
  if (!data) return { error: "User not found", status: 404 };

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      status: data.user.status,
      isOperator: data.user.is_operator === true || data.user.is_operator === 1,
      createdAt: data.user.created_at,
    },
    subscription: data.subscription
      ? {
          id: data.subscription.id,
          planId: data.subscription.plan_id,
          planName: data.subscription.plan_name,
          planSlug: data.subscription.plan_slug,
          status: data.subscription.status,
          currentPeriodEnd: data.subscription.current_period_end,
          stripeCustomerId: data.subscription.stripe_customer_id,
        }
      : null,
    usage: {
      promptTokens: Number(data.usage?.prompt_tokens ?? 0),
      completionTokens: Number(data.usage?.completion_tokens ?? 0),
      requests: Number(data.usage?.requests ?? 0),
    },
    activeKeys: Number(data.keyCount?.total ?? 0),
  };
}

export async function updateOperatorUser(userId, body) {
  const user = await getUserByIdRaw(userId);
  if (!user) return { error: "User not found", status: 404 };

  if (body.action === "suspend") {
    await suspendUser(userId);
    return { ok: true, status: "suspended" };
  }

  if (body.action === "reactivate") {
    await reactivateUser(userId);
    return { ok: true, status: "active" };
  }

  if (body.action === "override_plan" && body.planId) {
    const foundPlan = await overrideUserPlan(userId, body.planId);
    if (!foundPlan) return { error: "Plan not found", status: 400 };
    return { ok: true, planId: body.planId };
  }

  if (body.action === "reset_trial") {
    const didReset = await resetUserTrial(userId);
    if (!didReset) return { error: "Trial plan not found", status: 500 };
    return { ok: true, action: "trial_reset" };
  }

  if (body.action === "set_operator") {
    await setUserOperator(userId, body.isOperator);
    return { ok: true, isOperator: Boolean(body.isOperator) };
  }

  return { error: "Unknown action", status: 400 };
}
