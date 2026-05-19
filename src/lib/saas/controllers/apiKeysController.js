import { NextResponse } from "next/server";
import { requireSaasUser } from "@/lib/saas/routeAuth.js";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/lib/saas/services/apiKeysService.js";

function authError(authz) {
  return NextResponse.json({ error: authz.error }, { status: authz.status });
}

export async function handleListApiKeys() {
  const authz = await requireSaasUser();
  if (!authz.ok) return authError(authz);

  return NextResponse.json(await listApiKeys(authz.user.id));
}

export async function handleCreateApiKey(request) {
  const authz = await requireSaasUser();
  if (!authz.ok) return authError(authz);

  const body = await request.json().catch(() => ({}));
  const result = await createApiKey(authz.user.id, body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ key: result.key }, { status: result.status });
}

export async function handleRevokeApiKey(_request, { params }) {
  const authz = await requireSaasUser();
  if (!authz.ok) return authError(authz);

  const { id } = await params;
  const result = await revokeApiKey(authz.user.id, id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true });
}
