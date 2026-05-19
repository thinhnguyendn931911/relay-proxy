// Postgres adapter for 9Router (SaaS fork).
//
// Contract: matches the SQLite adapters' surface (run/get/all/exec/transaction)
// but every method is async. Existing repos call these from inside async functions
// and after the await-codemod, `await db.xxx(...)` works against either backend
// (await on a sync value is a no-op).
//
// SQL translation strategy:
//   - `?` placeholders          → $1, $2, ... (PG style)
//   - INSERT OR REPLACE INTO    → INSERT ... ON CONFLICT (pk) DO UPDATE SET ...
//   - INSERT OR IGNORE INTO     → INSERT ... ON CONFLICT DO NOTHING
//   - PRAGMA table_info(t)      → information_schema.columns lookup
//   - PRAGMA *                  → no-op
//   - INTEGER PRIMARY KEY
//       AUTOINCREMENT           → BIGSERIAL PRIMARY KEY
//
// Identifier casing: we let PG fold unquoted camelCase to lowercase (its default),
// then transform result rows back to camelCase via a known column map so existing
// repos see {connectionId, isActive, ...} as before.
//
// Transactions use AsyncLocalStorage so repos calling `db.run(...)` inside a
// `db.transaction(async () => { ... })` block automatically use the same
// connection without having to pass a tx handle around.

import pg from "pg";
import { AsyncLocalStorage } from "node:async_hooks";

const { Pool } = pg;
const txStorage = new AsyncLocalStorage();

// ─── Primary key map (used for INSERT OR REPLACE translation) ────────────
const PK_OVERRIDE = {
  kv: ["scope", "key"],
  _meta: ["key"],
  usageDaily: ["dateKey"],
  settings: ["id"],
};
function pkFor(table) {
  return PK_OVERRIDE[table] || ["id"];
}

// ─── camelCase column map (PG returns lowercase; we map back) ────────────
// Add new camelCase columns here whenever schema.js gains one.
const COLUMN_REMAP = {
  authtype: "authType",
  isactive: "isActive",
  createdat: "createdAt",
  updatedat: "updatedAt",
  teststatus: "testStatus",
  machineid: "machineId",
  datekey: "dateKey",
  connectionid: "connectionId",
  apikey: "apiKey",
  prompttokens: "promptTokens",
  completiontokens: "completionTokens",
  userid: "userId",
  lastusedat: "lastUsedAt",
  revokedat: "revokedAt",
};
function remapRow(row) {
  if (!row) return row;
  const out = {};
  for (const k in row) out[COLUMN_REMAP[k] ?? k] = row[k];
  return out;
}

// ─── SQL translator ─────────────────────────────────────────────────────
function translateSql(rawSql) {
  let sql = rawSql;

  // PRAGMA table_info(t) → information_schema. PG lowercases unquoted names.
  const ti = sql.match(/^\s*PRAGMA\s+table_info\s*\(\s*([\w"]+)\s*\)\s*;?\s*$/i);
  if (ti) {
    const tableName = ti[1].replace(/"/g, "").toLowerCase();
    return {
      sql: `SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND lower(table_name) = $1`,
      params: [tableName],
      skip: false,
      forcePositional: true,
    };
  }

  // Any other PRAGMA → no-op (we'll return empty results)
  if (/^\s*PRAGMA\b/i.test(sql)) {
    return { sql: null, skip: true };
  }

  // INTEGER PRIMARY KEY AUTOINCREMENT → BIGSERIAL PRIMARY KEY  (in CREATE TABLE)
  sql = sql.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, "BIGSERIAL PRIMARY KEY");

  // INSERT OR REPLACE INTO t(cols) VALUES(...) → ON CONFLICT (pk) DO UPDATE SET ...
  const orReplace = sql.match(/^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)/i);
  if (orReplace) {
    const [, tbl, colsStr] = orReplace;
    const cols = colsStr.split(",").map((c) => c.trim());
    const pkCols = pkFor(tbl);
    const updates = cols
      .filter((c) => !pkCols.some((p) => p.toLowerCase() === c.toLowerCase()))
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");
    sql = sql.replace(/^\s*INSERT\s+OR\s+REPLACE\s+INTO/i, "INSERT INTO");
    sql = updates
      ? `${sql} ON CONFLICT (${pkCols.join(", ")}) DO UPDATE SET ${updates}`
      : `${sql} ON CONFLICT (${pkCols.join(", ")}) DO NOTHING`;
  }

  // INSERT OR IGNORE INTO ... → INSERT INTO ... ON CONFLICT DO NOTHING
  if (/^\s*INSERT\s+OR\s+IGNORE\s+/i.test(sql)) {
    sql = sql.replace(/^\s*INSERT\s+OR\s+IGNORE\s+/i, "INSERT ");
    sql = `${sql} ON CONFLICT DO NOTHING`;
  }

  // ? placeholders → $1, $2, ...
  let n = 0;
  sql = sql.replace(/\?/g, () => `$${++n}`);

  return { sql, skip: false };
}

// ─── Adapter ────────────────────────────────────────────────────────────
export async function createPgAdapter(connectionString) {
  if (!connectionString) throw new Error("[pg] DATABASE_URL is required");

  const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 20),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (err) => {
    console.error("[pg] pool error:", err.message);
  });

  // Verify connectivity
  const probe = await pool.connect();
  probe.release();

  async function runQuery(rawSql, params = []) {
    const t = translateSql(rawSql);
    if (t.skip) return { rows: [], rowCount: 0 };

    const finalParams = t.forcePositional ? t.params : params;
    const tx = txStorage.getStore();
    const runner = tx?.client || pool;
    return runner.query(t.sql, finalParams);
  }

  const onShutdown = () => {
    pool.end().catch(() => {});
  };
  process.once("beforeExit", onShutdown);
  process.once("SIGINT", () => { onShutdown(); process.exit(0); });
  process.once("SIGTERM", () => { onShutdown(); process.exit(0); });

  return {
    driver: "postgres",

    async run(sql, params = []) {
      const r = await runQuery(sql, params);
      return { changes: r.rowCount ?? 0 };
    },

    async get(sql, params = []) {
      const r = await runQuery(sql, params);
      return remapRow(r.rows[0]);
    },

    async all(sql, params = []) {
      const r = await runQuery(sql, params);
      return r.rows.map(remapRow);
    },

    async exec(sql) {
      // exec() may contain multiple statements separated by `;`. PG accepts
      // multi-statement queries when using the simple protocol (no params).
      const t = translateSql(sql);
      if (t.skip) return;
      const tx = txStorage.getStore();
      const runner = tx?.client || pool;
      await runner.query(t.sql);
    },

    async transaction(fn) {
      const existing = txStorage.getStore();

      // Nested transaction → use a savepoint on the existing client
      if (existing) {
        const sp = `sp_${Math.random().toString(36).slice(2, 10)}`;
        await existing.client.query(`SAVEPOINT ${sp}`);
        try {
          const r = await fn();
          await existing.client.query(`RELEASE SAVEPOINT ${sp}`);
          return r;
        } catch (e) {
          await existing.client.query(`ROLLBACK TO SAVEPOINT ${sp}`).catch(() => {});
          throw e;
        }
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await txStorage.run({ client }, () => fn());
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },

    checkpoint() {
      // no-op for PG
    },

    async close() {
      await pool.end().catch(() => {});
    },

    raw: pool,
  };
}
