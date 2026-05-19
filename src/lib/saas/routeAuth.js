import { auth } from "@clerk/nextjs/server";
import { getUserById } from "./userRepo.js";

export async function requireOperator() {
  if (!process.env.CLERK_SECRET_KEY) return { ok: true, legacy: true };

  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };

  const user = await getUserById(userId);
  if (!user?.isOperator) return { ok: false, status: 403, error: "Forbidden" };

  return { ok: true, user };
}
