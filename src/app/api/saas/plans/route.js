import { handleListPlans } from "@/lib/saas/controllers/plansController.js";

export async function GET() {
  return handleListPlans();
}
