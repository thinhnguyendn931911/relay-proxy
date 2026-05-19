import { handleUserUsage } from "@/lib/saas/controllers/usageController.js";

export async function GET() {
  return handleUserUsage();
}
