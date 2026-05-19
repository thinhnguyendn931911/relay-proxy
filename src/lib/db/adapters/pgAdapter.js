import pg from "pg";
import { AsyncLocalStorage } from "node:async_hooks";

const { Pool } = pg;
const txStorage = new AsyncLocalStorage();

const PRIMARY_KEYS = {
  _meta: ["key"],
  apiKeys: ["id"],
  combos: ["id"],
  kv: ["scope", "key"],
  providerConnections: ["id"],
  providerNodes: ["id"],
  proxyPools: ["id"],
  requestDetails: ["id"],
  settings: ["id"],
  usageDaily: ["dateKey"],
  usageHistory: ["id"],
};

const COLUMN_REMAP = {
  apikey: "apiKey",
  authtype: "authType",
  completiontokens: "completionTokens",
  connectionid: "connectionId",
  createdat: "createdAt",
  datekey: "dateKey",
  isactive: "isActive",
  lastinsertrowid: "lastInsertRowid",
  lastusedat: "lastUsedAt",
  machineid: "machineId",
  prompttokens: "promptTokens",
  revokedat: "revokedAt",
  teststatus: "testStatus",
  updatedat: "updatedAt",
  userid: "userId",
};

function remapRow(row) {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[COLUMN_REMAP[key] ?? key] = value;
  }
  return out;
}

function replacePlaceholders(sql) {
  let index = 0;
  let out = "";
  let quote = null;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (quote) {
      out += ch;
      if (ch === quote && next === quote) {
        out += next;
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      out += ch;
      continue;
    }

    if (ch === "?") {
      index += 1;
      out += `$${index}`;
      continue;
    }

    out += ch;
  }

  return out;
}

function primaryKeyFor(tableName) {
  return PRIMARY_KEYS[tableName] ?? PRIMARY_KEYS[tableName.toLowerCase()] ?? ["id"];
}

function translateInsertOrReplace(sql) {
  const match = sql.match(/^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+([A-Za-z_][\w]*)\s*\(([^)]+)\)/i);
  if (!match) return sql;

  const [, tableName, rawColumns] = match;
  const columns = rawColumns.split(",").map((col) => col.trim());
  const primaryKeys = primaryKeyFor(tableName);
  const updates = columns
    .filter((col) => !primaryKeys.some((pk) => pk.toLowerCase() === col.toLowerCase()))
    .map((col) => `${col} = EXCLUDED.${col}`)
    .join(", ");

  const insertSql = sql.replace(/^\s*INSERT\s+OR\s+REPLACE\s+INTO/i, "INSERT INTO");
  if (!updates) return `${insertSql} ON CONFLICT (${primaryKeys.join(", ")}) DO NOTHING`;
  return `${insertSql} ON CONFLICT (${primaryKeys.join(", ")}) DO UPDATE SET ${updates}`;
}

export function translateSql(rawSql) {
  let sql = rawSql;

  const tableInfo = sql.match(/^\s*PRAGMA\s+table_info\s*\(\s*"?([\w]+)"?\s*\)\s*;?\s*$/i);
  if (tableInfo) {
    return {
      sql: `
        SELECT
          ordinal_position - 1 AS cid,
          column_name AS name,
          data_type AS type,
          CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS notnull,
          column_default AS dflt_value,
          CASE WHEN column_name IN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_schema = current_schema()
              AND lower(tc.table_name) = lower($1)
          ) THEN 1 ELSE 0 END AS pk
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND lower(table_name) = lower($1)
        ORDER BY ordinal_position
      `,
      params: [tableInfo[1]],
      skip: false,
    };
  }

  if (/^\s*PRAGMA\b/i.test(sql)) {
    return { sql: null, params: [], skip: true };
  }

  sql = sql.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, "BIGSERIAL PRIMARY KEY");
  sql = translateInsertOrReplace(sql);

  if (/^\s*INSERT\s+OR\s+IGNORE\s+/i.test(sql)) {
    sql = sql.replace(/^\s*INSERT\s+OR\s+IGNORE\s+/i, "INSERT ");
    sql = `${sql} ON CONFLICT DO NOTHING`;
  }

  return { sql: replacePlaceholders(sql), params: null, skip: false };
}

export async function createPgAdapter(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error("[DB][pg] DATABASE_URL is required");

  const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 20),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (err) => {
    console.error("[DB][pg] pool error:", err.message);
  });

  const probe = await pool.connect();
  probe.release();

  async function query(rawSql, params = []) {
    const translated = translateSql(rawSql);
    if (translated.skip) return { rows: [], rowCount: 0 };

    const client = txStorage.getStore()?.client ?? pool;
    return client.query(translated.sql, translated.params ?? params);
  }

  async function close() {
    await pool.end().catch(() => {});
  }

  const onShutdown = () => {
    close().catch(() => {});
  };
  process.once("beforeExit", onShutdown);
  process.once("SIGINT", () => {
    onShutdown();
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    onShutdown();
    process.exit(0);
  });

  return {
    driver: "postgres",
    raw: pool,

    async run(sql, params = []) {
      const result = await query(sql, params);
      return { changes: result.rowCount ?? 0, lastInsertRowid: result.rows?.[0]?.id ?? null };
    },

    async get(sql, params = []) {
      const result = await query(sql, params);
      return remapRow(result.rows[0]);
    },

    async all(sql, params = []) {
      const result = await query(sql, params);
      return result.rows.map(remapRow);
    },

    async exec(sql) {
      const translated = translateSql(sql);
      if (translated.skip) return;
      const client = txStorage.getStore()?.client ?? pool;
      await client.query(translated.sql);
    },

    async transaction(fn) {
      const existing = txStorage.getStore();
      if (existing?.client) {
        const savepoint = `sp_${Math.random().toString(36).slice(2, 10)}`;
        await existing.client.query(`SAVEPOINT ${savepoint}`);
        try {
          const result = await fn();
          await existing.client.query(`RELEASE SAVEPOINT ${savepoint}`);
          return result;
        } catch (err) {
          await existing.client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`).catch(() => {});
          throw err;
        }
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await txStorage.run({ client }, () => fn());
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },

    checkpoint() {},
    close,
  };
}
