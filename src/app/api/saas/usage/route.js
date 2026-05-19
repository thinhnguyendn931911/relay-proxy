import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/db/driver.js";
import { requireSaasUser } from "@/lib/saas/routeAuth.js";

export async function GET() {
  const authz = await requireSaasUser();
  if (!authz.ok) return NextResponse.json({ error: authz.error }, { status: authz.status });

  const db = await getAdapter();
  const userId = authz.user.id;
  const now = new Date();
  const periodKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const period = await db.get(
    `SELECT prompt_tokens, completion_tokens, requests FROM saas_usage_periods WHERE user_id = ? AND period_yyyymm = ?`,
    [userId, periodKey]
  );

  const recent = await db.all(
    `SELECT timestamp, provider, model, promptTokens, completionTokens, status
     FROM usageHistory
     WHERE userid = ?
     ORDER BY id DESC
     LIMIT 50`,
    [userId]
  );

  const dailyRows = await db.all(
    `SELECT DATE(timestamp) AS day, SUM(promptTokens) AS prompt, SUM(completionTokens) AS completion
     FROM usageHistory
     WHERE userid = ? AND timestamp >= ?
     GROUP BY DATE(timestamp)
     ORDER BY day ASC`,
    [userId, new Date(now.getFullYear(), now.getMonth(), 1).toISOString()]
  );

  return NextResponse.json({
    period: {
      key: periodKey,
      promptTokens: Number(period?.prompt_tokens ?? 0),
      completionTokens: Number(period?.completion_tokens ?? 0),
      requests: Number(period?.requests ?? 0),
    },
    daily: dailyRows.map((r) => ({
      day: r.day,
      promptTokens: Number(r.prompt ?? 0),
      completionTokens: Number(r.completion ?? 0),
    })),
    recent: recent.map((r) => ({
      timestamp: r.timestamp,
      provider: r.provider,
      model: r.model,
      promptTokens: r.promptTokens ?? r.prompttokens ?? 0,
      completionTokens: r.completionTokens ?? r.completiontokens ?? 0,
      status: r.status,
    })),
  });
}
