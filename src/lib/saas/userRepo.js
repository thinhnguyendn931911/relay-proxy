import { getAdapter } from "@/lib/db/driver.js";

function normalizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    isOperator: row.is_operator === true || row.is_operator === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserById(id) {
  const db = await getAdapter();
  return normalizeUser(await db.get(`SELECT * FROM saas_users WHERE id = ?`, [id]));
}

export async function createOrUpdateUser({ id, email }) {
  const db = await getAdapter();
  let user;

  await db.transaction(async () => {
    if (db.driver === "postgres") {
      await db.exec(`LOCK TABLE saas_users IN SHARE ROW EXCLUSIVE MODE`);
    }

    const existing = await db.get(`SELECT * FROM saas_users WHERE id = ?`, [id]);
    const count = await db.get(`SELECT COUNT(*) AS count FROM saas_users`);
    const isFirstUser = Number(count?.count ?? count?.c ?? 0) === 0;

    user = await db.get(
      `INSERT INTO saas_users (id, email, status, is_operator, created_at, updated_at)
       VALUES (?, ?, 'active', ?, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         email = excluded.email,
         updated_at = NOW()
       RETURNING *`,
      [id, email, existing ? existing.is_operator : isFirstUser]
    );
  });

  return normalizeUser(user);
}

export async function updateUserEmail(id, email) {
  const db = await getAdapter();
  return normalizeUser(await db.get(
    `UPDATE saas_users SET email = ?, updated_at = NOW() WHERE id = ? RETURNING *`,
    [email, id]
  ));
}

export async function setUserStatus(id, status) {
  const db = await getAdapter();
  return normalizeUser(await db.get(
    `UPDATE saas_users SET status = ?, updated_at = NOW() WHERE id = ? RETURNING *`,
    [status, id]
  ));
}

export async function setOperator(id, isOperator) {
  const db = await getAdapter();
  return normalizeUser(await db.get(
    `UPDATE saas_users SET is_operator = ?, updated_at = NOW() WHERE id = ? RETURNING *`,
    [isOperator, id]
  ));
}
