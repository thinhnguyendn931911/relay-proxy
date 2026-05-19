import { NextResponse } from "next/server";
import { requireOperator } from "@/lib/saas/routeAuth.js";
import {
  getOperatorUser,
  listOperatorUsers,
  updateOperatorUser,
} from "@/lib/saas/services/userAdminService.js";

function authError(authz) {
  return NextResponse.json({ error: authz.error }, { status: authz.status });
}

export async function handleListUsers(request) {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  return NextResponse.json(await listOperatorUsers({
    status: searchParams.get("status"),
    search: searchParams.get("q"),
    page,
  }));
}

export async function handleGetUser(_request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  const { id } = await params;
  const result = await getOperatorUser(id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result);
}

export async function handleUpdateUser(request, { params }) {
  const op = await requireOperator();
  if (!op.ok) return authError(op);

  const { id } = await params;
  const result = await updateOperatorUser(id, await request.json());
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result);
}
