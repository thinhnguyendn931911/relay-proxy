import { handleUpdatePlan } from "@/lib/saas/controllers/plansController.js";

export async function PATCH(request, context) {
  return handleUpdatePlan(request, context);
}
