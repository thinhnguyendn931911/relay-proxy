## Why

9Router is a single-tenant local AI gateway. To monetize it as a hosted service, it needs multi-tenancy: user signup, per-user API keys, monthly token quotas, plan-based model gating, RPM rate limiting, and Stripe billing. The existing provider routing, RTK compression, and format translation stay unchanged — the SaaS layer wraps around them.

## What Changes

- **Database**: SQLite → PostgreSQL (concurrent multi-tenant load requires it)
- **Auth**: Replace single-password dashboard login with Clerk (signup, session, webhooks)
- **API keys**: Scoped per-user (`sk_user_…`), with create/revoke lifecycle
- **Request pipeline**: Every `/v1/*` request resolves to a user; usage recorded per-user
- **Quota enforcement**: Monthly token cap (hard 429), per-plan model gating (403), per-tier RPM sliding window (429)
- **Subscription model**: Free trial (14d, 50K tokens, limited models) + single Paid plan ($10/mo, 2.5M tokens, all models) seeded in DB, operator-tunable
- **User dashboard**: `/app/*` routes — keys, usage, plan, quick-start docs
- **Operator dashboard**: Existing `/dashboard/*` routes kept, plus new user/plan/usage admin pages
- **Billing**: Stripe Checkout for upgrades, webhook sync for subscription lifecycle
- **Deployment**: VPS single-process + Postgres, Caddy reverse proxy, daily `pg_dump` backups

## Capabilities

### New Capabilities
- `postgres-adapter`: SQLite-to-Postgres adapter translating query syntax, with async support via codemod
- `clerk-auth`: Clerk-based signup/login, webhook user sync, operator auto-promotion, route protection
- `user-api-keys`: Per-user API key CRUD with HMAC storage, `sk_user_` prefix, soft revocation
- `tenant-request-pipeline`: Resolve API key → user on every `/v1/*` request, record per-user usage
- `plan-quota-enforcement`: Monthly token cap check, model-pattern gating, subscription status validation
- `rpm-rate-limiting`: In-memory sliding-window RPM limiter per user, per-tier limits
- `user-dashboard`: End-user pages for keys, usage charts, plan/upgrade, quick-start docs
- `operator-admin`: Admin pages for user management, plan editing, aggregate usage
- `stripe-billing`: Checkout session creation, webhook handling for subscription lifecycle
- `vps-deployment`: Production deployment config — process manager, reverse proxy, backups, crons

### Modified Capabilities
<!-- No existing specs to modify — greenfield SaaS layer on top of unchanged 9Router core -->

## Impact

- **Database layer**: All `db.*` calls become async (codemod sweep across repos, migrate.js, usage modules). SQLite path preserved as fallback.
- **Auth**: Old password-based login removed. Clerk env vars required.
- **`/v1/*` API surface**: Always requires user API key (no more optional toggle). New 429/403 error responses with rate-limit headers.
- **Dependencies added**: `pg`, `@clerk/nextjs`, `svix`, `stripe`
- **Environment**: 10+ new env vars (Postgres, Clerk, Stripe)
- **File layout**: New `src/lib/saas/` module, new `src/app/(user)/` route group, new `src/app/api/saas/` and `src/app/api/stripe/` routes
