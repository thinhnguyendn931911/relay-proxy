import {
  handleCreateApiKey,
  handleListApiKeys,
} from "@/lib/saas/controllers/apiKeysController.js";

export async function GET() {
  return handleListApiKeys();
}

export async function POST(request) {
  return handleCreateApiKey(request);
}
