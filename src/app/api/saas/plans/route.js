import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import { getAdapter } from "@/lib/db/driver.js";

function normalizePlan(row) {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    monthlyTokenCap: Number(row.monthly_token_cap),
    rpmLimit: Number(row.rpm_limit),
    priceCents: Number(row.price_cents),
    trialDays: Number(row.trial_days),
    allowedModelPatterns:
      typeof row.allowed_model_patterns === "string"
        ? JSON.parse(row.allowed_model_patterns)
        : row.allowed_model_patterns || [],
    stripePriceId: row.stripe_price_id,
    isActive: row.is_active === true || row.is_active === 1,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const db = await getAdapter();
  const rows = await db.all(`SELECT * FROM saas_plans ORDER BY created_at ASC`);
  return NextResponse.json({ plans: rows.map(normalizePlan) });
}
