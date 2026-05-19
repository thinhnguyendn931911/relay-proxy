import { getAdapter } from "@/lib/db/driver.js";

// --- RPM sliding-window limiter (in-memory) ---
const rpmBuckets = new Map();

function checkRpm(userId, rpmLimit) {
  if (!rpmLimit || rpmLimit <= 0) return null;
  const now = Date.now();
  const windowMs = 60_000;

  let timestamps = rpmBuckets.get(userId);
  if (!timestamps) {
    timestamps = [];
    rpmBuckets.set(userId, timestamps);
  }

  // Evict expired entries
  while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= rpmLimit) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      status: 429,
      body: { error: "rate_limit_exceeded" },
      headers: { "Retry-After": String(retryAfterSec) },
    };
  }

  timestamps.push(now);
  return null;
}

// Cleanup inactive buckets every 30s
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamps] of rpmBuckets) {
    while (timestamps.length > 0 && timestamps[0] <= now - 60_000) {
      timestamps.shift();
    }
    if (timestamps.length === 0) rpmBuckets.delete(userId);
  }
}, 30_000).unref();

// --- Subscription status check ---
const BLOCKED_STATUSES = new Set(["expired", "canceled", "past_due"]);

function checkSubscription(subscription) {
  if (!subscription) {
    return {
      status: 403,
      body: { error: "no_subscription", upgrade_url: "/app/plan" },
    };
  }
  if (BLOCKED_STATUSES.has(subscription.status)) {
    return {
      status: 403,
      body: { error: `subscription_${subscription.status}`, upgrade_url: "/app/plan" },
    };
  }
  return null;
}

// --- Model gating ---
function checkModelAccess(requestedModel, allowedPatterns) {
  if (!Array.isArray(allowedPatterns) || allowedPatterns.length === 0) return null;

  const model = requestedModel || "";
  for (const pattern of allowedPatterns) {
    if (matchGlob(pattern, model)) return null;
  }

  return {
    status: 403,
    body: { error: "model_not_in_plan", upgrade_url: "/app/plan" },
  };
}

function matchGlob(pattern, value) {
  const regex = new RegExp(
    "^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
  );
  return regex.test(value);
}

// --- Monthly quota check ---
async function checkMonthlyQuota(userId, plan) {
  if (!plan.monthlyTokenCap || plan.monthlyTokenCap <= 0) return null;

  const db = await getAdapter();
  const now = new Date();
  const periodKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const row = await db.get(
    `SELECT prompt_tokens, completion_tokens FROM saas_usage_periods WHERE user_id = ? AND period_yyyymm = ?`,
    [userId, periodKey]
  );

  const used = row ? Number(row.prompt_tokens) + Number(row.completion_tokens) : 0;
  const cap = plan.monthlyTokenCap;

  if (used >= cap) {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const resetUnix = Math.floor(monthEnd.getTime() / 1000);
    const retryAfterSec = Math.max(1, resetUnix - Math.floor(Date.now() / 1000));

    return {
      status: 429,
      body: { error: "monthly_quota_exceeded", upgrade_url: "/app/plan" },
      headers: {
        "X-RateLimit-Limit": String(cap),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetUnix),
        "Retry-After": String(retryAfterSec),
      },
    };
  }

  return null;
}

function guardResponse(result) {
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...(result.headers || {}),
    },
  });
}

/**
 * Run the full SaaS guard chain on a resolved tenant.
 * Order: RPM → subscription status → model gate → monthly quota
 * @returns {Response|null} — Response to return to the client, or null if all checks pass
 */
export async function runTenantGuards(tenant, requestedModel) {
  const { userId, plan, subscription } = tenant;

  // 1. RPM limit
  const rpmResult = checkRpm(userId, plan.rpmLimit);
  if (rpmResult) return guardResponse(rpmResult);

  // 2. Subscription status
  const subResult = checkSubscription(subscription);
  if (subResult) return guardResponse(subResult);

  // 3. Model gating
  const modelResult = checkModelAccess(requestedModel, plan.allowedModelPatterns);
  if (modelResult) return guardResponse(modelResult);

  // 4. Monthly quota
  const quotaResult = await checkMonthlyQuota(userId, plan);
  if (quotaResult) return guardResponse(quotaResult);

  return null;
}

// --- Trial expiration ---
export async function expireOverdueTrials() {
  const db = await getAdapter();
  const result = await db.run(
    `UPDATE saas_subscriptions
     SET status = 'expired', updated_at = NOW()
     WHERE status = 'trialing' AND current_period_end < NOW()`
  );
  return result?.changes ?? 0;
}
