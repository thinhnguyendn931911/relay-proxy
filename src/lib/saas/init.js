import {
  API_KEYS_PATCH_SQL,
  DEFAULT_PLANS,
  SAAS_TABLES_SQL,
  USAGE_HISTORY_PATCH_SQL,
} from "./schema.js";

export async function ensureSaasSchema(adapter) {
  if (adapter.driver !== "postgres") return;

  for (const ddl of SAAS_TABLES_SQL) {
    await adapter.exec(ddl);
  }

  for (const ddl of API_KEYS_PATCH_SQL) {
    await adapter.exec(ddl);
  }

  for (const ddl of USAGE_HISTORY_PATCH_SQL) {
    await adapter.exec(ddl);
  }

  for (const plan of DEFAULT_PLANS) {
    await adapter.run(
      `INSERT INTO saas_plans
         (id, slug, display_name, monthly_token_cap, rpm_limit, price_cents,
          trial_days, allowed_model_patterns, stripe_price_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)
       ON CONFLICT (id) DO NOTHING`,
      [
        plan.id,
        plan.slug,
        plan.display_name,
        plan.monthly_token_cap,
        plan.rpm_limit,
        plan.price_cents,
        plan.trial_days,
        JSON.stringify(plan.allowed_model_patterns),
        plan.stripe_price_id,
      ]
    );
  }
}
