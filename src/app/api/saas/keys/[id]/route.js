import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revokeKey } from "@/lib/localDb";

export async function DELETE(request, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const revoked = await revokeKey(userId, id);
  if (!revoked) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
