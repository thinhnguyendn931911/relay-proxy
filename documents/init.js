// One-time bootstrap for the SaaS tables. Called by driver.js after the
// main migrator finishes, so the SaaS schema is layered on top of the
// existing 9Router schema without disturbing it.

import {
  SAAS_TABLES_SQL,
  API_KEYS_PATCH_SQL,
  USAGE_HISTORY_PATCH_SQL,
  DEFAULT_PLANS,
} from "./schema.js";

export async function ensureSaasSchema(adapter) {
  if (adapter.driver !== "postgres") {
    // The SaaS fork only runs on Postgres. If someone boots a SQLite
    // adapter we don't blow up — we just skip the SaaS surface, so 9Router
    // still works in single-tenant mode for local dev.
    console.log("[saas] non-postgres adapter; SaaS tables not created");
    return;
  }

  // Tables and indexes
  for (const ddl of SAAS_TABLES_SQL) {
    await adapter.exec(ddl);
  }

  // Patches to existing 9Router tables
  for (const ddl of API_KEYS_PATCH_SQL) {
    await adapter.exec(ddl);
  }
  for (const ddl of USAGE_HISTORY_PATCH_SQL) {
    await adapter.exec(ddl);
  }

  // Seed default plans (idempotent — INSERT ... ON CONFLICT DO NOTHING)
  for (const p of DEFAULT_PLANS) {
    await adapter.run(
      `INSERT INTO saas_plans
         (id, slug, display_name, monthly_token_cap, rpm_limit, price_cents,
          trial_days, allowed_model_patterns, stripe_price_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.slug,
        p.display_name,
        p.monthly_token_cap,
        p.rpm_limit,
        p.price_cents,
        p.trial_days,
        JSON.stringify(p.allowed_model_patterns),
        p.stripe_price_id,
      ]
    );
  }

  console.log(`[saas] schema ready (${SAAS_TABLES_SQL.length} statements, ${DEFAULT_PLANS.length} default plans)`);
}
