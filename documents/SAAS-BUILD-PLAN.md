# 9Router SaaS Fork — Build Plan

> Status: planning complete, not yet implemented.
> Base repo: https://github.com/decolua/9router
> Branch strategy: long-lived fork (`saas` branch off `master`), occasional rebases on upstream.

---

## 1. Goal

Turn 9Router from a single-tenant local AI gateway into a multi-tenant SaaS. End users sign up, get a personal API key, consume a monthly token allowance against your shared upstream provider pool, and upgrade via Stripe. You retain the original 9Router admin surface as an operator-only area.

---

## 2. Locked decisions

| Area | Choice | Why |
|---|---|---|
| Base | Fork of 9Router (Next.js 16, React 19, Node 20+) | Inherit RTK, format translation, provider routing |
| Database | PostgreSQL via `pg` (node-postgres) | SQLite doesn't fit multi-tenant concurrent load |
| Auth | Clerk | Built-in UI, free to 10K MAU, fastest TTM |
| Provider credentials | Pool — operator owns all | User picked this; cleanest UX |
| Tiers | Free trial + single Paid plan | Simplest MVP |
| Quota behavior | Hard block (HTTP 429) on monthly cap exhausted | User picked |
| Rate limit granularity | Monthly token cap + per-tier RPM (sliding window) | Protects shared pool from burst abuse |
| Billing | Stripe | User picked; integrated in Phase 9 not deferred |
| Deployment | VPS — single Node process + Postgres on same box | User picked |

### Seeded tier values (configurable in `saas_plans` table, not hard-coded)

| | Free trial | Paid |
|---|---|---|
| Monthly token cap | 50,000 | 2,500,000 |
| Trial length | 14 days | n/a |
| Price | $0 | $10/mo |
| RPM limit | 10 | 60 |
| Allowed models | `kr/*`, `oc/*`, `vertex/*` (free upstream only) | All |

Rationale: "half of common AI free" → typical free tiers are ~100K tokens, so 50K. "Half of common paid" → typical $20/mo plans, so $10. Free-tier model gating protects your shared upstream quota from trial abuse.

---

## 3. Architecture

### Request lifecycle

```
[Client CLI] ── POST /v1/chat/completions  Authorization: Bearer sk_user_…
       │
       ▼
[SaaS guard middleware (NEW)]
       1. resolve key → {userId, plan, subscription_status}
       2. enforce model gate (plan.allowed_model_patterns)
       3. RPM sliding window check
       4. monthly token cap check (read saas_usage_periods)
       │ on fail → 429 with x-ratelimit-* + retry-after
       ▼
[9Router handleChat (UNCHANGED)]
       provider routing → RTK compression → format translation
       │
       ▼
[Operator provider pool]   (kiro, glm, claude-code, …)
       │
       ▼ response streams back
[Usage writer (PATCHED)]
       writes to usageHistory(userId=…), increments saas_usage_periods
```

### Two UI surfaces, both under Clerk auth

| Path prefix | Audience | Built on |
|---|---|---|
| `/app/*` | End user — keys, usage, plan, billing | New routes |
| `/dashboard/*` | Operator — providers, combos, OAuth, users, plans | Existing 9Router routes + new admin views |

Gating: `users.is_operator = true` flag controls `/dashboard/*` access. First user signed up via Clerk webhook is auto-promoted to operator.

---

## 4. Database schema (Postgres)

### Existing 9Router tables — ported as-is

Same columns and indexes as `src/lib/db/schema.js`. Identifiers are unquoted so PG folds camelCase to lowercase; the Postgres adapter remaps result columns back to camelCase so existing repos read `row.connectionId` as expected.

| Table | Notes |
|---|---|
| `_meta` | key/value |
| `settings` | singleton (id=1) |
| `providerConnections` | operator-only |
| `providerNodes` | operator-only |
| `proxyPools` | operator-only |
| `combos` | operator-only |
| `kv` | scoped K/V |
| `apiKeys` | **patched** — add `userid`, `lastusedat`, `revokedat` |
| `usageHistory` | **patched** — add `userid` + index `(userid, timestamp DESC)` |
| `usageDaily` | aggregate, unchanged |
| `requestDetails` | unchanged |

### New tables (SaaS-only, snake_case)

```sql
-- saas_users
id            TEXT PRIMARY KEY        -- matches Clerk user id
email         TEXT NOT NULL
status        TEXT NOT NULL DEFAULT 'active'  -- active | suspended
is_operator   BOOLEAN NOT NULL DEFAULT FALSE
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- Indexes: lower(email), status

-- saas_plans
id                      TEXT PRIMARY KEY
slug                    TEXT UNIQUE NOT NULL   -- 'free_trial' | 'paid'
display_name            TEXT NOT NULL
monthly_token_cap       BIGINT NOT NULL
rpm_limit               INTEGER NOT NULL
price_cents             INTEGER NOT NULL DEFAULT 0
trial_days              INTEGER NOT NULL DEFAULT 0
allowed_model_patterns  JSONB NOT NULL DEFAULT '[]'::jsonb
stripe_price_id         TEXT
is_active               BOOLEAN NOT NULL DEFAULT TRUE
created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- saas_subscriptions
id                       TEXT PRIMARY KEY
user_id                  TEXT NOT NULL REFERENCES saas_users(id) ON DELETE CASCADE
plan_id                  TEXT NOT NULL REFERENCES saas_plans(id)
status                   TEXT NOT NULL   -- trialing | active | past_due | canceled | expired
current_period_start     TIMESTAMPTZ NOT NULL
current_period_end       TIMESTAMPTZ NOT NULL
stripe_customer_id       TEXT
stripe_subscription_id   TEXT
created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- Partial unique idx: one active sub per user
--   ON (user_id) WHERE status IN ('trialing','active','past_due')

-- saas_usage_periods  (fast-path counter, read on every request)
user_id            TEXT NOT NULL REFERENCES saas_users(id) ON DELETE CASCADE
period_yyyymm      CHAR(6) NOT NULL   -- '202605'
prompt_tokens      BIGINT NOT NULL DEFAULT 0
completion_tokens  BIGINT NOT NULL DEFAULT 0
requests           BIGINT NOT NULL DEFAULT 0
updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
PRIMARY KEY (user_id, period_yyyymm)
```

RPM limiting needs **no table** — in-memory sliding window keyed by `user_id`. For multi-instance later, swap to Redis.

---

## 5. Phased build plan

Each phase is independently shippable and testable. Numbers in `()` are rough effort estimates assuming you already know Next.js — pad as needed.

### Phase 1 — DB foundation: SQLite → Postgres (3–5 days)

**Goal:** existing 9Router boots against Postgres unchanged from a user-functionality standpoint.

**Tasks:**
1. Add deps: `pg`, `@types/pg` (if TS).
2. Create `src/lib/db/adapters/pgAdapter.js` — async adapter matching existing `run/get/all/exec/transaction` surface. Translates: `?` → `$N`, `INSERT OR REPLACE` → `ON CONFLICT DO UPDATE`, `INSERT OR IGNORE` → `ON CONFLICT DO NOTHING`, `INTEGER PRIMARY KEY AUTOINCREMENT` → `BIGSERIAL PRIMARY KEY`, `PRAGMA table_info` → `information_schema.columns`, other `PRAGMA *` → no-op. Uses `AsyncLocalStorage` so nested `db.run` calls inside `db.transaction(fn)` reuse the same client.
3. Patch `src/lib/db/driver.js` — add `tryPg()` returning the new adapter when `DATABASE_URL` is set, prefer it over SQLite drivers.
4. Patch `src/lib/db/migrate.js` — for PG, lowercase both sides of the column-diff comparison in `syncSchemaFromTables`. Skip the data.sqlite file-backup branch when adapter is PG.
5. Write a one-time codemod (`scripts/saas-await-codemod.mjs`) that adds `await ` before every `db.run|get|all|exec|transaction(` call in `src/lib/db/**/*.js`, `src/lib/db/index.js`, `src/lib/db/migrate.js`, `src/lib/usage*.js`, and helper modules. Run it once, commit the result. Awaiting a sync value is a no-op, so the SQLite adapters keep working too.
6. Create `src/lib/saas/schema.js` with new table DDLs (see §4) and `DEFAULT_PLANS` seed.
7. Create `src/lib/saas/init.js` exporting `ensureSaasSchema(adapter)` which runs SaaS DDLs + patches `apiKeys` and `usageHistory` + seeds default plans. Call from `driver.js` after `runMigrationOnce`.
8. Update `.env.example`: add `DATABASE_URL=postgres://user:pass@localhost:5432/9router_saas`.

**Validation:**
- `psql` shows all original tables + 4 saas_* tables + 2 default plans seeded.
- `npm run dev` boots without errors, dashboard renders, you can still configure providers in the operator UI.

**Files created/modified:**
- New: `src/lib/db/adapters/pgAdapter.js`, `src/lib/saas/schema.js`, `src/lib/saas/init.js`, `scripts/saas-await-codemod.mjs`
- Patched: `src/lib/db/driver.js`, `src/lib/db/migrate.js`, `package.json`, `.env.example`
- Sweep (codemod): every `*Repo.js` under `src/lib/db/repos/`, plus `src/lib/db/index.js`, `src/lib/db/migrate.js`, `src/lib/usage/fetcher.js`, `src/lib/usageDb.js`

---

### Phase 2 — Clerk + users table (2–3 days)

**Goal:** users sign up via Clerk, get a row in `saas_users`, first signup auto-becomes operator.

**Tasks:**
1. Add deps: `@clerk/nextjs`, `svix` (for webhook signature verification).
2. Wrap `src/app/layout.js` with `<ClerkProvider>`.
3. Create `src/middleware.ts` (or `.js`) — Clerk middleware protecting `/app/*` and `/dashboard/*`.
4. Create `src/app/api/saas/clerk-webhook/route.js`:
   - Verify svix signature
   - On `user.created`: upsert into `saas_users`. If table is empty, set `is_operator=true`.
   - On `user.updated`: sync email/status.
   - On `user.deleted`: mark `status='suspended'` (don't hard-delete — preserves usage history).
5. Create `src/lib/saas/userRepo.js` — `getUserById`, `getUserByClerkId` (same id), `createUser`, `setOperator`, `setStatus`.
6. Gate the existing operator-only routes (`src/app/(dashboard)/dashboard/**`) with a Clerk middleware check that loads the user and asserts `is_operator=true`.
7. Remove the old 9Router single-password login flow (`src/app/login/`, `src/lib/auth/dashboardSession.js`) — Clerk replaces it.

**Validation:**
- Sign up at `/sign-up` (Clerk auto-provided) creates a `saas_users` row.
- First user has `is_operator=true`; subsequent users don't.
- Non-operator users get 403 on `/dashboard/*`.

**Env vars added:**
```
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

---

### Phase 3 — Per-user API keys (2 days)

**Goal:** users create and revoke their own API keys, scoped by `user_id`.

**Tasks:**
1. Rewrite `src/lib/db/repos/apiKeysRepo.js`:
   - `createApiKey({ userId, name })` — generates a key prefixed `sk_user_…`, stores HMAC hash (keep the existing `generateApiKeyWithMachine` pattern from `src/shared/utils/apiKey.js` but make it user-scoped).
   - `listKeysForUser(userId)`
   - `revokeKey(userId, keyId)` — sets `revokedat`, not delete (preserves usage history join).
   - `findUserByKey(key)` — used by Phase 4 middleware.
2. Replace `src/app/api/keys/route.js` with operator-only behavior, and add `src/app/api/saas/keys/route.js` for end-user CRUD. Both use Clerk session to identify the caller.
3. New user page: `src/app/(user)/app/keys/page.js` — list keys, create (returns the key once, never shown again), revoke. Use existing 9Router UI primitives.
4. Add `userId` to the existing `apiKeys` migration logic — already covered by Phase 1's patch, just ensure repo writes it.

**Validation:**
- Signed-in user creates keys via `/app/keys`; sees only their own.
- Revoked keys can't be re-used (will be enforced in Phase 4).

---

### Phase 4 — Tenant-aware `/v1` (2 days)

**Goal:** every `/v1/*` request is associated with a user; usage records carry `userId`.

**Tasks:**
1. In `src/sse/services/auth.js`, replace `isValidApiKey(apiKey)` with `resolveApiKeyToUser(apiKey)` returning `{userId, user, plan, subscription} | null`. Uses `findUserByKey` from Phase 3 and loads plan+subscription via `userRepo`/`subscriptionRepo` (stubbed for Phase 4, fully populated in Phase 5).
2. Patch `src/sse/handlers/chat.js`:
   - At top of `handleChat`, replace the `settings.requireApiKey` block with: always require key → resolve to user → 401 if invalid → 403 if `user.status='suspended'`.
   - Pass `userId` through to `handleSingleModelChat` and onward to `handleChatCore`'s `onRequestSuccess` and the usage writer.
3. Same patch for `src/sse/handlers/embeddings.js`, `imageGeneration.js`, `tts.js`, `stt.js`, `search.js`, `fetch.js` — all entry points to the `/v1/*` surface.
4. Patch `usageRepo.recordRequest` (in `src/lib/db/repos/usageRepo.js`) — accept `userId` and store it in `usageHistory.userid`. Also UPSERT into `saas_usage_periods`:
   ```sql
   INSERT INTO saas_usage_periods (user_id, period_yyyymm, prompt_tokens, completion_tokens, requests, updated_at)
   VALUES ($1, to_char(NOW(),'YYYYMM'), $2, $3, 1, NOW())
   ON CONFLICT (user_id, period_yyyymm)
   DO UPDATE SET prompt_tokens = saas_usage_periods.prompt_tokens + EXCLUDED.prompt_tokens,
                 completion_tokens = saas_usage_periods.completion_tokens + EXCLUDED.completion_tokens,
                 requests = saas_usage_periods.requests + 1,
                 updated_at = NOW();
   ```
5. Force `settings.requireApiKey` to always be true in this fork — remove the toggle (the operator dashboard setting becomes meaningless).

**Validation:**
- Request with valid user key succeeds; usage row appears with `userid=…`.
- Request with revoked or non-existent key returns 401.
- `saas_usage_periods` counter increments correctly.

---

### Phase 5 — Plans, subscriptions, quota guard (3–4 days)

**Goal:** monthly token cap is enforced. Model-gate is enforced. New users automatically get a trial subscription.

**Tasks:**
1. Create `src/lib/saas/planRepo.js` — `listPlans`, `getPlanBySlug`, `getPlanById`, `updatePlan` (operator only).
2. Create `src/lib/saas/subscriptionRepo.js`:
   - `getActiveForUser(userId)`
   - `startTrial(userId)` — creates a subscription with `status='trialing'`, `plan_id='plan_free_trial'`, `current_period_end = NOW() + INTERVAL '14 days'`.
   - `expireOverdueTrials()` — cron-callable, flips `status='expired'` for trials past `current_period_end`.
   - `upgradeToPaid(userId, stripeSubId, customerId)` — Phase 9 wires this from Stripe webhook.
3. Patch Phase 2's webhook handler: on `user.created`, also call `startTrial(userId)`.
4. Create `src/lib/saas/quotaService.js`:
   - `checkQuota(user, plan, subscription)` — reads `saas_usage_periods` for current `YYYYMM`, returns `{ok, remaining, resetAt}` or `{ok:false, reason:'monthly_cap_exceeded', retryAfter}`.
   - `checkModelAllowed(plan, modelStr)` — matches model against `plan.allowed_model_patterns` (empty array means all allowed).
   - `checkSubscriptionActive(subscription)` — returns false if `status in ('canceled','expired','past_due')` — past_due gives a 3-day grace if needed (skip for MVP, hard-block).
5. Wire into `handleChat` from Phase 4, before forwarding to 9Router core. Return 429 with headers:
   ```
   X-RateLimit-Limit: <monthly_token_cap>
   X-RateLimit-Remaining: <remaining>
   X-RateLimit-Reset: <unix_ts_of_period_end>
   Retry-After: <seconds>
   ```
   For model-gate failures, return 403 with body `{error: "model_not_in_plan", upgrade_url: "/app/plan"}`.
6. Add a daily cron (Phase 10 covers ops): call `expireOverdueTrials()`.

**Validation:**
- Brand-new user gets a trial automatically. Requests work until 50K tokens consumed → 429.
- User tries `cc/claude-opus-4-7` on trial → 403 with upgrade hint.

---

### Phase 6 — RPM rate limiting (1 day)

**Goal:** prevent burst abuse of the shared pool.

**Tasks:**
1. Create `src/lib/saas/rateLimitService.js` — in-memory sliding window:
   ```js
   const buckets = new Map(); // userId → array of request timestamps (ms)
   export function consumeRequest(userId, rpmLimit) {
     const now = Date.now();
     const windowStart = now - 60_000;
     const arr = (buckets.get(userId) || []).filter(t => t >= windowStart);
     if (arr.length >= rpmLimit) {
       return { ok: false, retryAfter: Math.ceil((arr[0] + 60_000 - now) / 1000) };
     }
     arr.push(now);
     buckets.set(userId, arr);
     return { ok: true };
   }
   ```
   Run a periodic cleanup (`setInterval(prune, 30_000)`) to keep memory bounded.
2. Wire into the guard chain in `handleChat` BEFORE the quota check (cheaper to reject early).
3. Add `Retry-After` header on 429.

**Note for multi-instance later:** swap the `Map` for Redis with a Lua sliding window script. Out of scope for VPS-single-instance MVP.

**Validation:**
- Trial user spamming 11 requests/minute gets one 429.
- Counter clears after 60s.

---

### Phase 7 — User dashboard pages (3–4 days)

**Goal:** signed-in users have a usable UI for keys, usage, plan.

**Routes:**
- `/app/keys` — Phase 3 already built.
- `/app/usage` — chart of daily token usage in current month + recent requests table. Query: `SELECT date_trunc('day', timestamp::timestamptz) as day, sum(prompttokens+completiontokens) FROM usageHistory WHERE userid=$1 AND timestamp >= $2 GROUP BY 1 ORDER BY 1`.
- `/app/plan` — show current subscription, plan limits, "Upgrade" button (links to Stripe in Phase 9 or to a "contact sales" mailto for MVP if Stripe not yet wired).
- `/app/docs` — quick-start: how to point Cursor/Claude Code/Cline at `https://your-saas-domain/v1` with the user's key. Just static content, no DB.

**Implementation note:** reuse 9Router's existing UI component library under `src/app/(dashboard)/`. The user-facing pages live under a new route group `src/app/(user)/app/` with their own layout.

---

### Phase 8 — Admin / operator pages (3–4 days)

**Goal:** you (operator) can manage tenants without touching the database directly.

**New routes under `/dashboard/`:**
- `/dashboard/users` — list users, filter by status. Each user → drill-down with their keys, usage, current subscription. Buttons: suspend, reactivate, override plan, reset trial.
- `/dashboard/plans` — edit `monthly_token_cap`, `rpm_limit`, `price_cents`, `allowed_model_patterns`. Live-tunable without redeploy.
- `/dashboard/usage` — aggregate dashboard: total tokens this month, requests, top users by usage, by-provider breakdown.

**Existing 9Router pages stay** under `/dashboard/` — providers, combos, OAuth, settings.

---

### Phase 9 — Stripe billing (3–5 days)

**Goal:** users upgrade from trial to paid with a credit card.

**Tasks:**
1. Add `stripe` SDK.
2. Create products + prices in the Stripe dashboard (or via API). Store the resulting `price_id` into `saas_plans.stripe_price_id`.
3. New routes:
   - `POST /api/stripe/checkout-session` — creates a Stripe Checkout session, returns the URL. Called from `/app/plan` "Upgrade" button.
   - `POST /api/stripe/webhook` — handles:
     - `checkout.session.completed` → call `subscriptionRepo.upgradeToPaid(userId, stripeSubId, customerId)`.
     - `customer.subscription.updated` → sync `current_period_*`, `status`.
     - `customer.subscription.deleted` → set `status='canceled'`, but keep service until `current_period_end`, then `'expired'` via cron.
     - `invoice.payment_failed` → `status='past_due'`.
4. Add Stripe customer portal link in `/app/plan` for users to manage their subscription (cancel, update card).

**Env vars added:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PAID=
```

---

### Phase 10 — Deploy & ops (2–3 days)

**Goal:** running in production on a VPS.

**Tasks:**
1. **Postgres setup:** install on the same VPS or use a managed PG service (Neon, Supabase Postgres, RDS). For pure VPS, install PG 16, create DB+user, configure `pg_hba.conf` for local-only connections.
2. **Process manager:** PM2 or systemd unit. `npm run build && npm run start` with `PORT=3000`, `NODE_ENV=production`.
3. **Reverse proxy:** Caddy (simplest, auto-TLS) or nginx in front, proxy `https://api.yourdomain.com → localhost:3000`.
4. **Backups:** nightly `pg_dump` cron → off-box storage (S3, Backblaze).
5. **Monitoring:** at minimum, uptime check (Better Stack / Uptime Robot) on `/api/health`. Log aggregation optional (Axiom, Logflare).
6. **Stripe webhook target:** `https://api.yourdomain.com/api/stripe/webhook`. Clerk webhook target: same domain `/api/saas/clerk-webhook`.
7. **Cron jobs:** systemd timer or simple `node-cron` inside the app — runs `expireOverdueTrials()` daily at 03:00.
8. **Operator account:** sign up first (via Clerk), confirm `is_operator=true` in `saas_users`. Make sure no public sign-up reaches the dashboard before you've done this.

**Smoke tests before going live:**
- Sign up → trial provisioned → can create key → key works on `/v1` → usage records appear → hit monthly cap → 429 → upgrade via Stripe → cap unlocks.

---

## 6. Open decisions / risks / deferred

| Item | Status |
|---|---|
| Multi-instance scaling | RPM bucket needs Redis. Out of MVP scope. |
| Provider quota starvation | If trial users exhaust your shared Kiro/OpenCode quota, paid users are also affected. Mitigations: per-provider RPM ceiling, separate combo per tier (operator UI work). |
| API key rotation policy | Phase 3 supports manual revoke. No auto-rotation. |
| Soft overage / auto top-up | User chose hard block. Revisit after launch if churn signals. |
| Free tier abuse (multi-account signups) | Clerk has basic anti-fraud. Consider: email-domain blocklists, phone verification, single-trial-per-Stripe-customer enforcement. |
| Data export / GDPR | Phase 7+: add `/app/export` (downloads user's own usage history JSON). Not blocking MVP. |
| Audit log for operator actions | Recommended but not in MVP. Add an `operator_actions` table in Phase 8 if useful. |

---

## 7. Effort estimate

| Phase | Effort |
|---|---|
| 1 — DB foundation | 3–5 days |
| 2 — Clerk + users | 2–3 days |
| 3 — Per-user keys | 2 days |
| 4 — Tenant-aware /v1 | 2 days |
| 5 — Plans + quota | 3–4 days |
| 6 — RPM | 1 day |
| 7 — User dashboard | 3–4 days |
| 8 — Admin pages | 3–4 days |
| 9 — Stripe | 3–5 days |
| 10 — Deploy | 2–3 days |
| **Total** | **24–35 working days** |

Solo developer who knows Next.js. Significantly less if you skip Stripe (defer to manual onboarding for first 10 customers), more if you've never touched Clerk or PG before.

---

## 8. Appendix: environment variables (final)

```
# Postgres
DATABASE_URL=postgres://9router:password@localhost:5432/9router_saas
PG_POOL_MAX=20

# Clerk
CLERK_PUBLISHABLE_KEY=pk_…
CLERK_SECRET_KEY=sk_…
CLERK_WEBHOOK_SECRET=whsec_…

# Stripe
STRIPE_SECRET_KEY=sk_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_PRICE_ID_PAID=price_…

# 9Router originals (kept)
JWT_SECRET=…
API_KEY_SECRET=…
MACHINE_ID_SALT=…
BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com

# Deployment
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

---

## 9. Files referenced (final layout)

```
src/
├── app/
│   ├── (user)/
│   │   └── app/
│   │       ├── keys/page.js
│   │       ├── usage/page.js
│   │       ├── plan/page.js
│   │       └── docs/page.js
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── users/page.js          # Phase 8 NEW
│   │       ├── plans/page.js          # Phase 8 NEW
│   │       ├── usage/page.js          # Phase 8 NEW
│   │       └── (existing 9Router pages…)
│   ├── api/
│   │   ├── v1/                        # Phase 4 patched
│   │   ├── saas/
│   │   │   ├── clerk-webhook/route.js # Phase 2 NEW
│   │   │   └── keys/route.js          # Phase 3 NEW
│   │   └── stripe/
│   │       ├── checkout-session/route.js  # Phase 9 NEW
│   │       └── webhook/route.js           # Phase 9 NEW
│   └── layout.js                      # Phase 2 patched (ClerkProvider)
├── middleware.ts                      # Phase 2 NEW
├── lib/
│   ├── db/
│   │   ├── adapters/pgAdapter.js      # Phase 1 NEW
│   │   ├── driver.js                  # Phase 1 patched
│   │   ├── migrate.js                 # Phase 1 patched
│   │   ├── repos/                     # Phase 1 codemod (await) + Phase 3/4 patches
│   │   └── …
│   └── saas/                          # ALL NEW
│       ├── schema.js
│       ├── init.js
│       ├── userRepo.js
│       ├── planRepo.js
│       ├── subscriptionRepo.js
│       ├── quotaService.js
│       └── rateLimitService.js
└── sse/
    ├── services/auth.js               # Phase 4 patched (resolveApiKeyToUser)
    └── handlers/
        ├── chat.js                    # Phase 4+5+6 patched (guard chain)
        ├── embeddings.js              # Phase 4 patched
        └── …
scripts/
└── saas-await-codemod.mjs             # Phase 1 NEW
.env.example                           # Phase 1+2+9 patched
package.json                           # Phase 1+2+9 patched
```

---

## 10. Notes on what was already started

Before you switched to plan-only mode I had begun Phase 1. The following files exist in my workspace and are ready to drop into your fork if you want a head start — they're not load-bearing, just saves you typing:

- `src/lib/db/adapters/pgAdapter.js` — full Postgres adapter as specced in Phase 1.2
- `src/lib/saas/schema.js` — table DDLs + default-plan seed as specced in §4
- `src/lib/saas/init.js` — `ensureSaasSchema()` as specced in Phase 1.7
- Partial patch to `src/lib/db/driver.js` (tryPg + ensureSaasSchema wiring)

They're attached alongside this plan. You can ignore them and start from scratch if you'd rather follow the plan strictly.
