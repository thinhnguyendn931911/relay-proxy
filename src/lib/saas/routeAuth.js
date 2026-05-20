import { auth, currentUser } from "@clerk/nextjs/server";
import { createOrUpdateUser, getUserById } from "./userRepo.js";
import { ensureTrialSubscription } from "./subscriptionRepo.js";

function hasClerkConfig() {
  return Boolean(process.env.CLERK_SECRET_KEY);
}

function withRole(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.isOperator ? "admin" : "user",
  };
}

async function autoProvision(userId) {
  const clerkUser = await currentUser();
  const email =
    clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    "";
  const user = await createOrUpdateUser({ id: userId, email });
  await ensureTrialSubscription(user.id);
  return user;
}

export async function requireSaasUser() {
  if (!hasClerkConfig()) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };

  let user = await getUserById(userId);
  if (!user) {
    user = await autoProvision(userId);
  }

  return { ok: true, user: withRole(user), userId };
}

export async function requireRole(role) {
  if (!hasClerkConfig() && role === "admin") {
    return { ok: true, legacy: true };
  }

  const result = await requireSaasUser();
  if (!result.ok || result.legacy) return result;

  if (role === "admin" && result.user.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return result;
}

export async function requireOperator() {
  return requireRole("admin");
}
