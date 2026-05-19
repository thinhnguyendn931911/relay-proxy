import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import { getAdapter } from "@/lib/db/driver.js";

export async function GET() {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const db = await getAdapter();
  const now = new Date();
  const periodKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totals = await db.get(
    `SELECT COALESCE(SUM(prompt_tokens),0) AS prompt_tokens,
            COALESCE(SUM(completion_tokens),0) AS completion_tokens,
            COALESCE(SUM(requests),0) AS requests
     FROM saas_usage_periods
     WHERE period_yyyymm = ?`,
    [periodKey]
  );

  const topUsers = await db.all(
    `SELECT up.user_id, u.email,
            up.prompt_tokens + up.completion_tokens AS total_tokens,
            up.requests
     FROM saas_usage_periods up
     JOIN saas_users u ON u.id = up.user_id
     WHERE up.period_yyyymm = ?
     ORDER BY total_tokens DESC
     LIMIT 10`,
    [periodKey]
  );

  const providerBreakdown = await db.all(
    `SELECT provider, COUNT(*) AS requests,
            SUM(promptTokens) AS prompt_tokens,
            SUM(completionTokens) AS completion_tokens
     FROM usageHistory
     WHERE userid IS NOT NULL
       AND timestamp >= ?
     GROUP BY provider
     ORDER BY requests DESC`,
    [new Date(now.getFullYear(), now.getMonth(), 1).toISOString()]
  );

  const userCount = await db.get(`SELECT COUNT(*) AS total FROM saas_users`);
  const activeSubCount = await db.get(
    `SELECT COUNT(*) AS total FROM saas_subscriptions WHERE status IN ('trialing','active')`
  );

  return NextResponse.json({
    period: periodKey,
    totals: {
      promptTokens: Number(totals?.prompt_tokens ?? 0),
      completionTokens: Number(totals?.completion_tokens ?? 0),
      requests: Number(totals?.requests ?? 0),
    },
    topUsers: topUsers.map((r) => ({
      userId: r.user_id,
      email: r.email,
      totalTokens: Number(r.total_tokens),
      requests: Number(r.requests),
    })),
    providerBreakdown: providerBreakdown.map((r) => ({
      provider: r.provider,
      requests: Number(r.requests),
      promptTokens: Number(r.prompt_tokens ?? 0),
      completionTokens: Number(r.completion_tokens ?? 0),
    })),
    userCount: Number(userCount?.total ?? 0),
    activeSubscriptions: Number(activeSubCount?.total ?? 0),
  });
}
