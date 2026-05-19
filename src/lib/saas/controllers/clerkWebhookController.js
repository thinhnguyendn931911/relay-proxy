import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { handleClerkEvent } from "@/lib/saas/services/clerkWebhookService.js";

function svixHeaders(headers) {
  return {
    "svix-id": headers.get("svix-id"),
    "svix-timestamp": headers.get("svix-timestamp"),
    "svix-signature": headers.get("svix-signature"),
  };
}

export async function handleClerkWebhook(request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "missing_clerk_webhook_secret" }, { status: 500 });
  }

  const payload = await request.text();
  let event;

  try {
    event = new Webhook(secret).verify(payload, svixHeaders(request.headers));
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  return NextResponse.json(await handleClerkEvent(event));
}
