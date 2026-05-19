import { handleClerkWebhook } from "@/lib/saas/controllers/clerkWebhookController.js";

export async function POST(request) {
  return handleClerkWebhook(request);
}
