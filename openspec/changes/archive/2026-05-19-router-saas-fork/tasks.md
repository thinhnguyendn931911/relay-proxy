## 1. Repository And Database Foundation

- [x] 1.1 Fork/import the 9Router codebase into this repository and verify the existing app boots unchanged with SQLite
- [x] 1.2 Add PostgreSQL, Clerk, Svix, and Stripe dependencies plus required environment variables in the example env file
- [x] 1.3 Create the Postgres adapter with `run`, `get`, `all`, `exec`, and `transaction` methods returning Promises
- [x] 1.4 Add SQLite-to-Postgres query translation for placeholders, `INSERT OR REPLACE`, `INSERT OR IGNORE`, and `PRAGMA table_info`
- [x] 1.5 Add `AsyncLocalStorage` transaction client reuse and nested transaction handling to the Postgres adapter
- [x] 1.6 Update the database driver to prefer Postgres when `DATABASE_URL` is set and preserve SQLite fallback
- [x] 1.7 Patch migration behavior for Postgres column comparisons and skip SQLite file backups on Postgres
- [x] 1.8 Add and run a codemod that awaits all existing `db.run`, `db.get`, `db.all`, `db.exec`, and `db.transaction` calls
- [x] 1.9 Add SaaS schema initialization for users, plans, subscriptions, usage periods, key ownership columns, usage ownership columns, and default plans
- [x] 1.10 Verify fresh Postgres startup creates original tables, SaaS tables, patched columns, indexes, and seeded plans

## 2. Clerk Auth And User Provisioning

- [x] 2.1 Wrap the Next.js app with Clerk provider support
- [x] 2.2 Add Clerk middleware requiring authentication for `/app/*` and `/dashboard/*`
- [x] 2.3 Create the Clerk webhook endpoint with Svix signature verification
- [x] 2.4 Implement user create, update, and delete sync into `saas_users`
- [x] 2.5 Auto-promote the first synced user to operator inside a transaction
- [x] 2.6 Create user and subscription repository functions needed by auth, billing, quota checks, and admin pages
- [x] 2.7 Provision every new user with a 14-day trial subscription on the free trial plan
- [x] 2.8 Replace old password dashboard login with Clerk-only authentication
- [x] 2.9 Gate `/dashboard/*` routes to `saas_users.is_operator=true` and return 403 for non-operators
- [x] 2.10 Verify first signup becomes operator, later signups become end users, and invalid webhooks do not change data

## 3. User API Keys

- [x] 3.1 Implement `sk_user_` API key generation and HMAC-only storage scoped to `userid`
- [x] 3.2 Add user key listing that returns only metadata for the authenticated user's active and revoked keys
- [x] 3.3 Add user key creation that returns plaintext exactly once
- [x] 3.4 Add user key revocation by setting `revokedat` instead of deleting rows
- [x] 3.5 Implement key lookup that returns `{ userId, user, plan, subscription }` for valid non-revoked keys
- [x] 3.6 Add `/api/saas/keys` endpoints for authenticated end-user key CRUD
- [x] 3.7 Keep existing operator key routes operator-only or remove user-facing access from them
- [x] 3.8 Build `/app/keys` page for listing, creating, copying, and revoking user keys
- [x] 3.9 Verify users cannot list, revoke, or use keys owned by another user

## 4. Tenant Request Pipeline

- [x] 4.1 Make every `/v1/*` request require an Authorization bearer key and remove the optional API-key toggle from request handling
- [x] 4.2 Resolve each API key to tenant context before provider routing begins
- [x] 4.3 Return 401 for missing, invalid, or revoked keys with the specified error bodies
- [x] 4.4 Return 403 for suspended users before provider routing begins
- [x] 4.5 Thread `userId` through chat request handling into success callbacks and usage recording
- [x] 4.6 Thread tenant context through embeddings, image generation, TTS, STT, search, and fetch handlers
- [x] 4.7 Update usage recording to write `usageHistory.userid`
- [x] 4.8 Atomically UPSERT monthly counters in `saas_usage_periods` whenever successful usage is recorded
- [x] 4.9 Verify valid keys succeed, rejected keys fail before routing, and usage counters increment per user

## 5. Plan, Quota, And RPM Enforcement

- [x] 5.1 Implement plan-pattern model matching with empty `allowed_model_patterns` meaning all models allowed
- [x] 5.2 Block requests for expired, canceled, and past-due subscriptions with upgrade response bodies
- [x] 5.3 Enforce model gating after suspension and RPM checks
- [x] 5.4 Enforce monthly token caps using `saas_usage_periods`
- [x] 5.5 Return 429 monthly quota responses with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`
- [x] 5.6 Implement per-user in-memory 60-second sliding-window RPM limiter using plan `rpm_limit`
- [x] 5.7 Run RPM checks before model and monthly quota checks
- [x] 5.8 Add periodic cleanup for inactive RPM buckets
- [x] 5.9 Add trial expiration job that marks overdue trial subscriptions as expired
- [x] 5.10 Verify guard order, rate-limit headers, model-gate responses, and trial expiration behavior

## 6. User Dashboard

- [x] 6.1 Create authenticated `/app/*` route group and end-user layout
- [x] 6.2 Build `/app/keys` against the user key endpoints
- [x] 6.3 Build `/app/usage` with current-period token chart and recent request table
- [x] 6.4 Build `/app/plan` with current plan, subscription status, usage against limits, upgrade action, and portal action for paid users
- [x] 6.5 Build `/app/docs` with client configuration snippets for Cursor, Claude Code, and Cline
- [x] 6.6 Verify non-authenticated users redirect to Clerk sign-in and authenticated users can use all `/app/*` pages

## 7. Operator Admin

- [x] 7.1 Add `/dashboard/users` list with status filters and user detail links
- [x] 7.2 Add operator actions to suspend, reactivate, override plan, and reset trial
- [x] 7.3 Add `/dashboard/plans` plan editor for token caps, RPM limits, prices, and allowed model patterns
- [x] 7.4 Ensure plan edits are read from the database by subsequent quota checks without redeploying
- [x] 7.5 Add `/dashboard/usage` aggregate metrics for monthly tokens, requests, top users, and provider breakdown
- [x] 7.6 Verify non-operators receive 403 for all operator pages and operator actions affect API behavior immediately

## 8. Stripe Billing

- [x] 8.1 Add Stripe client configuration and paid plan price mapping from database or environment
- [x] 8.2 Create authenticated `POST /api/stripe/checkout-session` endpoint with Clerk user reference
- [x] 8.3 Create Stripe webhook endpoint with signature verification
- [x] 8.4 Handle checkout completion by upgrading the user to the paid plan and storing Stripe IDs
- [x] 8.5 Sync subscription period and status updates from Stripe subscription webhooks
- [x] 8.6 Mark subscriptions canceled on deletion events while preserving the current period data
- [x] 8.7 Mark subscriptions past due on invoice payment failure
- [x] 8.8 Add Stripe Customer Portal session creation for paid users
- [x] 8.9 Verify invalid webhook signatures are rejected and successful checkout changes API entitlements

## 9. Deployment And Operations

- [x] 9.1 Add `/api/health` endpoint that checks app and database health
- [x] 9.2 Add production startup documentation for single Node process, Postgres, and reverse proxy TLS
- [x] 9.3 Add systemd or process-manager configuration for the app process
- [x] 9.4 Add daily trial-expiration cron or timer configuration
- [x] 9.5 Add nightly `pg_dump` backup instructions or scripts for off-box storage
- [x] 9.6 Document first-signup operator bootstrap sequence before public access opens
- [x] 9.7 Verify `npm run build` and production start succeed with required SaaS environment variables
