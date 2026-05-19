import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";
import { getAdapter } from "../driver.js";

const USER_KEY_PREFIX = "sk_user_";

function keyHash(key) {
  const secret = process.env.API_KEY_SECRET || "endpoint-proxy-api-key-secret";
  return crypto.createHmac("sha256", secret).update(key).digest("hex");
}

function generateUserApiKey() {
  return `${USER_KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
}

function rowToKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    machineId: row.machineId,
    isActive: row.isActive === 1 || row.isActive === true,
    createdAt: row.createdAt,
    userId: row.userId ?? row.userid ?? null,
    lastUsedAt: row.lastUsedAt ?? row.lastusedat ?? null,
    revokedAt: row.revokedAt ?? row.revokedat ?? null,
  };
}

function rowToUserKey(row) {
  const key = rowToKey(row);
  if (!key) return null;
  delete key.key;
  delete key.machineId;
  return key;
}

export async function getApiKeys() {
  const db = await getAdapter();
  const rows = await db.all(`SELECT * FROM apiKeys ORDER BY createdAt ASC`);
  return rows.map(rowToKey);
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = await db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return rowToKey(row);
}

export async function createApiKey(name, machineId) {
  if (!machineId) throw new Error("machineId is required");
  const db = await getAdapter();
  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);
  const apiKey = {
    id: uuidv4(),
    name,
    key: result.key,
    machineId,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, isActive, createdAt) VALUES(?, ?, ?, ?, ?, ?)`,
    [apiKey.id, apiKey.key, apiKey.name, apiKey.machineId, 1, apiKey.createdAt]
  );
  return apiKey;
}

export async function createUserApiKey({ userId, name }) {
  if (!userId) throw new Error("userId is required");
  if (!name) throw new Error("name is required");

  const db = await getAdapter();
  const plaintext = generateUserApiKey();
  const apiKey = {
    id: uuidv4(),
    key: keyHash(plaintext),
    name,
    userId,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, isActive, createdAt, userid, lastusedat, revokedat)
     VALUES(?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
    [apiKey.id, apiKey.key, apiKey.name, null, 1, apiKey.createdAt, apiKey.userId]
  );

  return { ...rowToUserKey(apiKey), key: plaintext };
}

export async function listKeysForUser(userId) {
  const db = await getAdapter();
  const rows = await db.all(
    `SELECT * FROM apiKeys WHERE userid = ? ORDER BY createdAt ASC`,
    [userId]
  );
  return rows.map(rowToUserKey);
}

export async function updateApiKey(id, data) {
  const db = await getAdapter();
  let result = null;
  await db.transaction(async () => {
    const row = await db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const merged = { ...rowToKey(row), ...data };
    await db.run(
      `UPDATE apiKeys SET key = ?, name = ?, machineId = ?, isActive = ? WHERE id = ?`,
      [merged.key, merged.name, merged.machineId, merged.isActive ? 1 : 0, id]
    );
    result = merged;
  });
  return result;
}

export async function deleteApiKey(id) {
  const db = await getAdapter();
  const res = await db.run(`DELETE FROM apiKeys WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function revokeKey(userId, keyId) {
  const db = await getAdapter();
  const result = await db.run(
    `UPDATE apiKeys SET revokedat = NOW(), isActive = 0 WHERE id = ? AND userid = ? AND revokedat IS NULL`,
    [keyId, userId]
  );
  return (result?.changes ?? 0) > 0;
}

export async function findUserByKey(key) {
  if (!key?.startsWith(USER_KEY_PREFIX)) return null;
  const db = await getAdapter();
  const row = await db.get(
    `SELECT
       k.id AS key_id,
       k.name AS key_name,
       k.lastusedat AS key_last_used_at,
       u.id AS user_id,
       u.email AS user_email,
       u.status AS user_status,
       u.is_operator AS user_is_operator,
       p.id AS plan_id,
       p.slug AS plan_slug,
       p.display_name AS plan_display_name,
       p.monthly_token_cap AS plan_monthly_token_cap,
       p.rpm_limit AS plan_rpm_limit,
       p.allowed_model_patterns AS plan_allowed_model_patterns,
       s.id AS subscription_id,
       s.status AS subscription_status,
       s.current_period_start AS subscription_current_period_start,
       s.current_period_end AS subscription_current_period_end
     FROM apiKeys k
     JOIN saas_users u ON u.id = k.userid
     JOIN saas_subscriptions s ON s.user_id = u.id AND s.status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')
     JOIN saas_plans p ON p.id = s.plan_id
     WHERE k.key = ?
       AND k.revokedat IS NULL
       AND k.isActive = 1
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [keyHash(key)]
  );

  if (!row) return null;

  await db.run(`UPDATE apiKeys SET lastusedat = NOW() WHERE id = ?`, [row.key_id]);

  return {
    userId: row.user_id,
    key: {
      id: row.key_id,
      name: row.key_name,
      lastUsedAt: row.key_last_used_at,
    },
    user: {
      id: row.user_id,
      email: row.user_email,
      status: row.user_status,
      isOperator: row.user_is_operator === true || row.user_is_operator === 1,
    },
    plan: {
      id: row.plan_id,
      slug: row.plan_slug,
      displayName: row.plan_display_name,
      monthlyTokenCap: Number(row.plan_monthly_token_cap),
      rpmLimit: Number(row.plan_rpm_limit),
      allowedModelPatterns: Array.isArray(row.plan_allowed_model_patterns)
        ? row.plan_allowed_model_patterns
        : JSON.parse(row.plan_allowed_model_patterns || "[]"),
    },
    subscription: {
      id: row.subscription_id,
      status: row.subscription_status,
      currentPeriodStart: row.subscription_current_period_start,
      currentPeriodEnd: row.subscription_current_period_end,
    },
  };
}

export async function validateApiKey(key) {
  if (key?.startsWith(USER_KEY_PREFIX)) {
    return Boolean(await findUserByKey(key));
  }

  const db = await getAdapter();
  const row = await db.get(`SELECT isActive FROM apiKeys WHERE key = ?`, [key]);
  if (!row) return false;
  return row.isActive === 1 || row.isActive === true;
}
