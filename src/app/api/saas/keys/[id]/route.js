import { handleRevokeApiKey } from "@/lib/saas/controllers/apiKeysController.js";

export async function DELETE(request, context) {
  return handleRevokeApiKey(request, context);
}
