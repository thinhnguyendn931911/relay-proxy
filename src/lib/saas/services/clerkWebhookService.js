import { ensureTrialSubscription } from "@/lib/saas/subscriptionRepo.js";
import {
  createOrUpdateUser,
  setUserStatus,
  updateUserEmail,
} from "@/lib/saas/userRepo.js";

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

export async function handleClerkEvent(event) {
  if (event.type === "user.created") {
    const email = primaryEmail(event.data);
    const user = await createOrUpdateUser({ id: event.data.id, email });
    await ensureTrialSubscription(user.id);
    return { ok: true };
  }

  if (event.type === "user.updated") {
    await updateUserEmail(event.data.id, primaryEmail(event.data));
    return { ok: true };
  }

  if (event.type === "user.deleted") {
    if (event.data.id) await setUserStatus(event.data.id, "suspended");
    return { ok: true };
  }

  return { ok: true, ignored: true };
}
