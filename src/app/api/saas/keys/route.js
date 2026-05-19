import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createUserApiKey, listKeysForUser } from "@/lib/localDb";

async function requireUserId() {
  const { userId } = await auth();
  return userId;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await listKeysForUser(userId);
  return NextResponse.json({ keys });
}

export async function POST(request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const key = await createUserApiKey({ userId, name });
  return NextResponse.json({ key }, { status: 201 });
}
