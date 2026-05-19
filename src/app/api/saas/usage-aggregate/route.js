import { handleUsageAggregate } from "@/lib/saas/controllers/usageController.js";

export async function GET() {
  return handleUsageAggregate();
}
