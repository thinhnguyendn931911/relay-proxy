import {
  handleGetUser,
  handleUpdateUser,
} from "@/lib/saas/controllers/userAdminController.js";

export async function GET(request, context) {
  return handleGetUser(request, context);
}

export async function PATCH(request, context) {
  return handleUpdateUser(request, context);
}
