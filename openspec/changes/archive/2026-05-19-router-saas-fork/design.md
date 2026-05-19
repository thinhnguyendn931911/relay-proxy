## Context

9Router is a Next.js 16 AI gateway that routes requests across providers with RTK compression and format translation. It runs single-tenant with SQLite storage and a password-protected dashboard. The codebase uses synchronous `db.*` calls throughout.

We're forking it to build a multi-tenant SaaS where end users sign up via Clerk, get API keys, consume tokens against a shared upstream provider pool, and upgrade via Stripe. The operator retains the existing dashboard for provider/combo management.

Key constraints:
- 9Router core (provider routing, RTK, format translation) stays unchanged
- SQLite sync DB calls permeate the codebase — Postgres adapter must be async-compatible
- Single VPS deployment for MVP (no Redis, no horizontal scaling)
- Two user roles: operator (first signup) and end users (everyone else)

## Goals / Non-Goals

**Goals:**
- Multi-tenant isolation: per-user keys, usage tracking, quota enforcement
- Postgres backend supporting concurrent multi-tenant load
- Clerk auth replacing the single-password login
- Two-tier subscription model (free trial + paid) with Stripe billing
- Operator admin UI for user/plan management without touching the database
- Hard enforcement of monthly token caps and per-tier RPM limits

**Non-Goals:**
- Horizontal scaling / multi-instance (no Redis, no distributed rate limiting)
- Soft overage / auto top-up / usage-based billing
- Multi-provider quota isolation (all tiers share the same upstream pool)
- API key auto-rotation
- GDPR data export (deferred post-MVP)
- Audit logging for operator actions

## Decisions

### D1: Postgres adapter wrapping existing sync interface → async with codemod

**Choice:** Create a `pgAdapter.js` that implements the same `run/get/all/exec/transaction` API as the SQLite adapters but returns Promises. Run a one-time codemod to add `await` before every `db.*` call across the codebase.

**Why over alternatives:**
- *Rewrite all repos to use a new async API* — too invasive, high risk of regressions in 9Router core
- *Use pg-sync or synchronous PG wrapper* — doesn't exist reliably for node-postgres; blocks the event loop
- Awaiting a sync return value is a no-op, so SQLite adapters keep working after the codemod

**Key details:** Adapter translates `?` → `$N`, `INSERT OR REPLACE` → `ON CONFLICT DO UPDATE`, `INSERT OR IGNORE` → `ON CONFLICT DO NOTHING`, `PRAGMA table_info` → `information_schema.columns`. Uses `AsyncLocalStorage` for transaction client reuse.

### D2: Clerk for auth (not NextAuth, not custom JWT)

**Choice:** Clerk with webhook-based user sync to `saas_users` table.

**Why:** Built-in signup/login UI, free to 10K MAU, webhook-driven so our DB stays authoritative for business logic. First user signed up auto-promoted to operator via empty-table check in webhook handler.

**Why not NextAuth:** More setup, no built-in UI, would need to build signup flows from scratch.

### D3: Two UI route groups under single Next.js app

**Choice:** `/app/*` for end users, `/dashboard/*` for operators. Both behind Clerk auth. Operator gating via `saas_users.is_operator` check in middleware.

**Why not separate apps:** Single deploy, shared DB connection, reuse UI components. The route-group pattern (`(user)` / `(dashboard)`) keeps layouts separate.

### D4: In-memory RPM sliding window (not Redis, not DB)

**Choice:** `Map<userId, timestamp[]>` with 60s window, periodic cleanup.

**Why:** Single-instance VPS — no need for distributed state. Survives restarts gracefully (window refills naturally). Swap to Redis later if scaling.

### D5: Usage counter via dedicated `saas_usage_periods` table

**Choice:** Fast-path UPSERT counter table keyed on `(user_id, period_yyyymm)` instead of aggregating from `usageHistory` on every request.

**Why:** Quota check happens on every `/v1/*` request. Aggregating millions of history rows per check is too slow. The counter is updated atomically via `ON CONFLICT DO UPDATE` alongside the history insert.

### D6: Hard block on quota exhaustion (not soft overage)

**Choice:** HTTP 429 with `X-RateLimit-*` headers and `Retry-After` when monthly cap hit. 403 with `upgrade_url` for model-gate violations.

**Why:** User's explicit choice. Simplest to implement. Revisit if churn data suggests soft overage would retain users.

### D7: Stripe Checkout (not embedded billing UI)

**Choice:** Redirect to Stripe Checkout for upgrades. Use Stripe Customer Portal for subscription management.

**Why:** Minimal frontend code, PCI compliance handled by Stripe, webhook-driven state sync keeps our DB authoritative.

## Risks / Trade-offs

- **Codemod sweep risk** — Adding `await` across ~30 files could introduce subtle bugs if any code depends on synchronous execution order → Mitigation: codemod is mechanical (regex), test full dashboard + `/v1` flow after applying
- **Provider pool starvation** — Trial users could exhaust shared upstream quotas affecting paid users → Mitigation: free-tier model gating limits exposure; operator can tune plan caps live. Future: per-tier combos
- **Single-instance RPM state** — Process restart clears all rate-limit windows → Mitigation: acceptable for MVP; windows refill within 60s. Swap to Redis if scaling
- **Clerk vendor lock-in** — User table synced via webhook; if Clerk goes down, new signups fail → Mitigation: existing users still work (keys resolve from local DB). Clerk has 99.9% SLA
- **First-user operator promotion race** — Two simultaneous first signups could both get `is_operator` → Mitigation: use `SELECT COUNT(*) ... FOR UPDATE` in a transaction; extremely unlikely on a fresh deploy
