import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  createOrUpdateUser,
  setUserStatus,
  updateUserEmail,
} from "@/lib/saas/userRepo.js";
import { ensureTrialSubscription } from "@/lib/saas/subscriptionRepo.js";

function primaryEmail(data) {
  const primaryId = data.primary_email_address_id;
  const emails = data.email_addresses || [];
  return (
    emails.find((email) => email.id === primaryId)?.email_address ||
    emails[0]?.email_address ||
    data.email_address ||
    ""
  );
}

function svixHeaders(headers) {
  return {
    "svix-id": headers.get("svix-id"),
    "svix-timestamp": headers.get("svix-timestamp"),
    "svix-signature": headers.get("svix-signature"),
  };
}

export async function POST(request) {
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

  if (event.type === "user.created") {
    const email = primaryEmail(event.data);
    const user = await createOrUpdateUser({ id: event.data.id, email });
    await ensureTrialSubscription(user.id);
    return NextResponse.json({ ok: true });
  }

  if (event.type === "user.updated") {
    await updateUserEmail(event.data.id, primaryEmail(event.data));
    return NextResponse.json({ ok: true });
  }

  if (event.type === "user.deleted") {
    if (event.data.id) await setUserStatus(event.data.id, "suspended");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
