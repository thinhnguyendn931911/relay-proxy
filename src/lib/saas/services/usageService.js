import {
  currentPeriod,
  getUsageAggregate,
  getUsageDashboard,
} from "@/lib/saas/data/usageData.js";

export async function getUserUsage(userId) {
  const period = currentPeriod();
  const data = await getUsageDashboard(userId, period);

  return {
    period: {
      key: period.key,
      promptTokens: Number(data.period?.prompt_tokens ?? 0),
      completionTokens: Number(data.period?.completion_tokens ?? 0),
      requests: Number(data.period?.requests ?? 0),
    },
    daily: data.dailyRows.map((r) => ({
      day: r.day,
      promptTokens: Number(r.prompt ?? 0),
      completionTokens: Number(r.completion ?? 0),
    })),
    recent: data.recent.map((r) => ({
      timestamp: r.timestamp,
      provider: r.provider,
      model: r.model,
      promptTokens: r.promptTokens ?? r.prompttokens ?? 0,
      completionTokens: r.completionTokens ?? r.completiontokens ?? 0,
      status: r.status,
    })),
  };
}

export async function getOperatorUsageAggregate() {
  const period = currentPeriod();
  const data = await getUsageAggregate(period);

  return {
    period: period.key,
    totals: {
      promptTokens: Number(data.totals?.prompt_tokens ?? 0),
      completionTokens: Number(data.totals?.completion_tokens ?? 0),
      requests: Number(data.totals?.requests ?? 0),
    },
    topUsers: data.topUsers.map((r) => ({
      userId: r.user_id,
      email: r.email,
      totalTokens: Number(r.total_tokens),
      requests: Number(r.requests),
    })),
    providerBreakdown: data.providerBreakdown.map((r) => ({
      provider: r.provider,
      requests: Number(r.requests),
      promptTokens: Number(r.prompt_tokens ?? 0),
      completionTokens: Number(r.completion_tokens ?? 0),
    })),
    userCount: Number(data.userCount?.total ?? 0),
    activeSubscriptions: Number(data.activeSubCount?.total ?? 0),
  };
}
