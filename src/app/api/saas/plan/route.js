import { handleCurrentPlan } from "@/lib/saas/controllers/plansController.js";

export async function GET() {
  return handleCurrentPlan();
}
