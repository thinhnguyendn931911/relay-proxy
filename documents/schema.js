// SaaS schema additions for the multi-tenant fork.
//
// These tables are PG-only (the fork requires Postgres). They use snake_case
// to avoid the case-folding gymnastics needed by 9Router's existing camelCase
// tables. Repos for these tables read columns directly without going through
// the COLUMN_REMAP in pgAdapter.
//
// All timestamps are stored as timestamptz so PG handles timezone math.
// Existing 9Router tables continue to store ISO strings in TEXT columns;
// that's a wart we live with to keep upstream merges easy.

export const SAAS_TABLES_SQL = [
  // ─── users ────────────────────────────────────────────────────────────
  // id is the Clerk user id (text). is_operator gates access to the original
  // 9Router admin dashboard (providers, combos, OAuth tokens).
  `CREATE TABLE IF NOT EXISTS saas_users (
     id              TEXT PRIMARY KEY,
     email           TEXT NOT NULL,
     status          TEXT NOT NULL DEFAULT 'active',
     is_operator     BOOLEAN NOT NULL DEFAULT FALSE,
     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_saas_users_email ON saas_users (lower(email))`,
  `CREATE INDEX IF NOT EXISTS idx_saas_users_status ON saas_users (status)`,

  // ─── plans ────────────────────────────────────────────────────────────
  // Seeded with free_trial + paid in init.js. allowed_model_patterns is a
  // JSONB array of glob-ish prefixes ("kr/*", "oc/*") that the request
  // middleware checks before forwarding to 9Router's chat handler.
  `CREATE TABLE IF NOT EXISTS saas_plans (
     id                      TEXT PRIMARY KEY,
     slug                    TEXT UNIQUE NOT NULL,
     display_name            TEXT NOT NULL,
     monthly_token_cap       BIGINT NOT NULL,
     rpm_limit               INTEGER NOT NULL,
     price_cents             INTEGER NOT NULL DEFAULT 0,
     trial_days              INTEGER NOT NULL DEFAULT 0,
     allowed_model_patterns  JSONB NOT NULL DEFAULT '[]'::jsonb,
     stripe_price_id         TEXT,
     is_active               BOOLEAN NOT NULL DEFAULT TRUE,
     created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,

  // ─── subscriptions ────────────────────────────────────────────────────
  // status: trialing | active | past_due | canceled | expired
  // exactly one active row per user (partial unique index on status).
  `CREATE TABLE IF NOT EXISTS saas_subscriptions (
     id                       TEXT PRIMARY KEY,
     user_id                  TEXT NOT NULL REFERENCES saas_users(id) ON DELETE CASCADE,
     plan_id                  TEXT NOT NULL REFERENCES saas_plans(id),
     status                   TEXT NOT NULL,
     current_period_start     TIMESTAMPTZ NOT NULL,
     current_period_end       TIMESTAMPTZ NOT NULL,
     stripe_customer_id       TEXT,
     stripe_subscription_id   TEXT,
     created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_saas_subs_user ON saas_subscriptions (user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_saas_subs_user_active
     ON saas_subscriptions (user_id)
     WHERE status IN ('trialing', 'active', 'past_due')`,
  `CREATE INDEX IF NOT EXISTS idx_saas_subs_stripe ON saas_subscriptions (stripe_subscription_id)`,

  // ─── usage_periods ────────────────────────────────────────────────────
  // Pre-aggregated counters read by the quota guard on every request.
  // period_yyyymm is e.g. '202605'. usage_history (the detailed table) is
  // the source of truth — this is the fast-path counter.
  `CREATE TABLE IF NOT EXISTS saas_usage_periods (
     user_id            TEXT NOT NULL REFERENCES saas_users(id) ON DELETE CASCADE,
     period_yyyymm      CHAR(6) NOT NULL,
     prompt_tokens      BIGINT NOT NULL DEFAULT 0,
     completion_tokens  BIGINT NOT NULL DEFAULT 0,
     requests           BIGINT NOT NULL DEFAULT 0,
     updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     PRIMARY KEY (user_id, period_yyyymm)
   )`,
];

// ─── Default plan seed ──────────────────────────────────────────────────
// Operator can override later via admin UI. Numbers reflect the
// "half of common AI free / paid" pricing direction.
export const DEFAULT_PLANS = [
  {
    id: "plan_free_trial",
    slug: "free_trial",
    display_name: "Free trial",
    monthly_token_cap: 50_000,
    rpm_limit: 10,
    price_cents: 0,
    trial_days: 14,
    // Restrict trial to operator-managed free upstream pools only.
    allowed_model_patterns: ["kr/*", "oc/*", "vertex/*"],
    stripe_price_id: null,
  },
  {
    id: "plan_paid",
    slug: "paid",
    display_name: "Paid",
    monthly_token_cap: 2_500_000,
    rpm_limit: 60,
    price_cents: 1000, // $10/mo
    trial_days: 0,
    // Empty array means "all models allowed".
    allowed_model_patterns: [],
    stripe_price_id: null, // wired in Phase 5
  },
];

// ─── Patch to existing apiKeys table ────────────────────────────────────
// Adds user_id + revoked_at + last_used_at to the original 9Router apiKeys
// table. Idempotent — uses IF NOT EXISTS.
export const API_KEYS_PATCH_SQL = [
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS userid TEXT`,
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS lastusedat TIMESTAMPTZ`,
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS revokedat TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS idx_apikeys_userid ON apiKeys (userid)`,
];

// ─── Patch to existing usageHistory table ───────────────────────────────
// Adds user_id so per-user analytics queries don't need a join.
export const USAGE_HISTORY_PATCH_SQL = [
  `ALTER TABLE usageHistory ADD COLUMN IF NOT EXISTS userid TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_usagehistory_userid_ts ON usageHistory (userid, timestamp DESC)`,
];
