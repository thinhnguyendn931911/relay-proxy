import { handleListUsers } from "@/lib/saas/controllers/userAdminController.js";

export async function GET(request) {
  return handleListUsers(request);
}
