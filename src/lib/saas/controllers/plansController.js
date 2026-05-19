import { NextResponse } from "next/server";
import { requireOperator, requireSaasUser } from "@/lib/saas/routeAuth.js";
import {
  getUserCurrentPlan,
  listOperatorPlans,
  updateOperatorPlan,
} from "@/lib/saas/services/plansService.js";

function authError(authz) {
  return NextResponse.json({ error: authz.error }, { status: authz.status });
}

export async function handleListPlans() {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  return NextResponse.json(await listOperatorPlans());
}

export async function handleUpdatePlan(request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  const { id } = await params;
  const result = await updateOperatorPlan(id, await request.json());
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ plan: result.plan });
}

export async function handleCurrentPlan() {
  const authz = await requireSaasUser();
  if (!authz.ok) return authError(authz);

  return NextResponse.json(await getUserCurrentPlan(authz.user.id));
}
