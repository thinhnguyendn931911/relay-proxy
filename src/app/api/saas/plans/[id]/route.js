import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import { getAdapter } from "@/lib/db/driver.js";

export async function PATCH(request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return NextResponse.json({ error: op.error }, { status: op.status });

  const { id } = await params;
  const body = await request.json();
  const db = await getAdapter();

  const existing = await db.get(`SELECT * FROM saas_plans WHERE id = ?`, [id]);
  if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const sets = [];
  const values = [];

  if (body.monthlyTokenCap !== undefined) {
    sets.push("monthly_token_cap = ?");
    values.push(Number(body.monthlyTokenCap));
  }
  if (body.rpmLimit !== undefined) {
    sets.push("rpm_limit = ?");
    values.push(Number(body.rpmLimit));
  }
  if (body.priceCents !== undefined) {
    sets.push("price_cents = ?");
    values.push(Number(body.priceCents));
  }
  if (body.allowedModelPatterns !== undefined) {
    sets.push("allowed_model_patterns = ?");
    values.push(JSON.stringify(body.allowedModelPatterns));
  }
  if (body.displayName !== undefined) {
    sets.push("display_name = ?");
    values.push(body.displayName);
  }
  if (body.stripePriceId !== undefined) {
    sets.push("stripe_price_id = ?");
    values.push(body.stripePriceId || null);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  values.push(id);
  await db.run(`UPDATE saas_plans SET ${sets.join(", ")} WHERE id = ?`, values);

  const updated = await db.get(`SELECT * FROM saas_plans WHERE id = ?`, [id]);
  return NextResponse.json({
    plan: {
      id: updated.id,
      slug: updated.slug,
      displayName: updated.display_name,
      monthlyTokenCap: Number(updated.monthly_token_cap),
      rpmLimit: Number(updated.rpm_limit),
      priceCents: Number(updated.price_cents),
      allowedModelPatterns:
        typeof updated.allowed_model_patterns === "string"
          ? JSON.parse(updated.allowed_model_patterns)
          : updated.allowed_model_patterns || [],
      stripePriceId: updated.stripe_price_id,
    },
  });
}
