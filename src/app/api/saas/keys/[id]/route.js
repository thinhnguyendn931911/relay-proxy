import { NextResponse } from "next/server";
import { revokeKey } from "@/lib/localDb";
import { requireSaasUser } from "@/lib/saas/routeAuth.js";

export async function DELETE(request, { params }) {
  const authz = await requireSaasUser();
  if (!authz.ok) return NextResponse.json({ error: authz.error }, { status: authz.status });

  const { id } = await params;
  const revoked = await revokeKey(authz.user.id, id);
  if (!revoked) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
