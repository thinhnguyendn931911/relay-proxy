import {
  createApiKeyForUser,
  listUserApiKeys,
  revokeUserApiKey,
} from "@/lib/saas/data/apiKeysData.js";

export async function listApiKeys(userId) {
  return { keys: await listUserApiKeys(userId) };
}

export async function createApiKey(userId, body) {
  const name = String(body?.name || "").trim();
  if (!name) return { error: "Name is required", status: 400 };

  return {
    key: await createApiKeyForUser({ userId, name }),
    status: 201,
  };
}

export async function revokeApiKey(userId, keyId) {
  const revoked = await revokeUserApiKey(userId, keyId);
  if (!revoked) return { error: "Key not found", status: 404 };
  return { ok: true };
}
