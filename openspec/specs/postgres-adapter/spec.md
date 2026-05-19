## ADDED Requirements

### Requirement: Postgres adapter matches existing DB interface
The system SHALL provide a `pgAdapter.js` that implements `run`, `get`, `all`, `exec`, and `transaction` methods returning Promises. The adapter SHALL translate SQLite syntax to Postgres: `?` → `$N`, `INSERT OR REPLACE` → `ON CONFLICT DO UPDATE`, `INSERT OR IGNORE` → `ON CONFLICT DO NOTHING`, `PRAGMA table_info` → `information_schema.columns` query, other `PRAGMA` → no-op.

#### Scenario: Parameter placeholder translation
- **WHEN** a query contains `?` placeholders
- **THEN** the adapter SHALL replace them with `$1`, `$2`, etc. in order

#### Scenario: INSERT OR REPLACE translation
- **WHEN** a query uses `INSERT OR REPLACE INTO <table>`
- **THEN** the adapter SHALL rewrite it as `INSERT INTO <table> ... ON CONFLICT DO UPDATE SET ...`

#### Scenario: PRAGMA table_info translation
- **WHEN** a query is `PRAGMA table_info(<table>)`
- **THEN** the adapter SHALL query `information_schema.columns` and return results in SQLite's `table_info` format (`cid`, `name`, `type`, `notnull`, `dflt_value`, `pk`)

### Requirement: Transaction client reuse via AsyncLocalStorage
The adapter SHALL use `AsyncLocalStorage` so that `db.run/get/all` calls inside a `db.transaction(fn)` callback reuse the same Postgres client. Nested transaction calls SHALL NOT deadlock.

#### Scenario: Nested db calls in transaction
- **WHEN** `db.transaction(async () => { await db.run(...); await db.get(...); })` is called
- **THEN** both inner calls SHALL execute on the same Postgres client without acquiring a new connection

### Requirement: Driver prefers Postgres when DATABASE_URL is set
The database driver SHALL check for `DATABASE_URL` environment variable and use the Postgres adapter when present. When `DATABASE_URL` is not set, the existing SQLite adapters SHALL be used.

#### Scenario: DATABASE_URL set
- **WHEN** `DATABASE_URL` environment variable is set to a valid Postgres connection string
- **THEN** the driver SHALL initialize the Postgres adapter and use it for all database operations

#### Scenario: DATABASE_URL not set
- **WHEN** `DATABASE_URL` environment variable is not set
- **THEN** the driver SHALL fall back to the existing SQLite adapter

### Requirement: Async codemod for existing db calls
A one-time codemod script SHALL add `await` before every `db.run`, `db.get`, `db.all`, `db.exec`, and `db.transaction` call across the codebase. Awaiting a synchronous return value SHALL be a no-op, preserving SQLite adapter compatibility.

#### Scenario: Codemod applied to repo files
- **WHEN** the codemod script runs against `src/lib/db/**/*.js` and related modules
- **THEN** all `db.run(`, `db.get(`, `db.all(`, `db.exec(`, `db.transaction(` calls SHALL be prefixed with `await`

#### Scenario: SQLite still works after codemod
- **WHEN** the codemod has been applied and `DATABASE_URL` is not set
- **THEN** the application SHALL boot and function identically using SQLite

### Requirement: Postgres migration compatibility
The migration system SHALL work with Postgres by lowercasing both sides of column-diff comparisons in `syncSchemaFromTables`. The SQLite-specific `data.sqlite` backup step SHALL be skipped when the adapter is Postgres.

#### Scenario: Column comparison case-insensitive on Postgres
- **WHEN** running migrations on Postgres (which folds unquoted identifiers to lowercase)
- **THEN** the migration system SHALL compare column names case-insensitively

### Requirement: SaaS schema initialization
The system SHALL create four SaaS tables (`saas_users`, `saas_plans`, `saas_subscriptions`, `saas_usage_periods`) on startup. It SHALL add `userid`, `lastusedat`, `revokedat` columns to `apiKeys` and a `userid` column + index to `usageHistory`. It SHALL seed two default plans (free_trial, paid) if they don't exist.

#### Scenario: Fresh Postgres database
- **WHEN** the application starts against an empty Postgres database
- **THEN** all original 9Router tables, four SaaS tables, patched columns, and two default plans SHALL exist

#### Scenario: Idempotent re-run
- **WHEN** `ensureSaasSchema` runs on a database that already has the SaaS tables
- **THEN** it SHALL not fail or duplicate seed data
