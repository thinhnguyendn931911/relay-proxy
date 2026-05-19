export const SAAS_TABLES_SQL = [
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

export const DEFAULT_PLANS = [
  {
    id: "plan_free_trial",
    slug: "free_trial",
    display_name: "Free trial",
    monthly_token_cap: 50_000,
    rpm_limit: 10,
    price_cents: 0,
    trial_days: 14,
    allowed_model_patterns: ["kr/*", "oc/*", "vertex/*"],
    stripe_price_id: null,
  },
  {
    id: "plan_paid",
    slug: "paid",
    display_name: "Paid",
    monthly_token_cap: 2_500_000,
    rpm_limit: 60,
    price_cents: 1000,
    trial_days: 0,
    allowed_model_patterns: [],
    stripe_price_id: null,
  },
];

export const API_KEYS_PATCH_SQL = [
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS userid TEXT`,
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS lastusedat TIMESTAMPTZ`,
  `ALTER TABLE apiKeys ADD COLUMN IF NOT EXISTS revokedat TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS idx_apikeys_userid ON apiKeys (userid)`,
];

export const USAGE_HISTORY_PATCH_SQL = [
  `ALTER TABLE usageHistory ADD COLUMN IF NOT EXISTS userid TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_usagehistory_userid_ts ON usageHistory (userid, timestamp DESC)`,
];
