import { NextResponse } from "next/server";
import { createUserApiKey, listKeysForUser } from "@/lib/localDb";
import { requireSaasUser } from "@/lib/saas/routeAuth.js";

export async function GET() {
  const authz = await requireSaasUser();
  if (!authz.ok) return NextResponse.json({ error: authz.error }, { status: authz.status });

  const keys = await listKeysForUser(authz.user.id);
  return NextResponse.json({ keys });
}

export async function POST(request) {
  const authz = await requireSaasUser();
  if (!authz.ok) return NextResponse.json({ error: authz.error }, { status: authz.status });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const key = await createUserApiKey({ userId: authz.user.id, name });
  return NextResponse.json({ key }, { status: 201 });
}
