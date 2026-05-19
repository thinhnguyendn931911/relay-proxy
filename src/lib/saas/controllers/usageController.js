import { NextResponse } from "next/server";
import { requireOperator, requireSaasUser } from "@/lib/saas/routeAuth.js";
import {
  getOperatorUsageAggregate,
  getUserUsage,
} from "@/lib/saas/services/usageService.js";

function authError(authz) {
  return NextResponse.json({ error: authz.error }, { status: authz.status });
}

export async function handleUserUsage() {
  const authz = await requireSaasUser();
  if (!authz.ok) return authError(authz);

  return NextResponse.json(await getUserUsage(authz.user.id));
}

export async function handleUsageAggregate() {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  return NextResponse.json(await getOperatorUsageAggregate());
}
