## ADDED Requirements

### Requirement: Single-VPS production deployment
The system SHALL run as a single Node.js process behind a reverse proxy (Caddy or nginx) with Postgres on the same VPS. TLS SHALL be handled by the reverse proxy.

#### Scenario: Production startup
- **WHEN** `npm run build && npm run start` is executed with `NODE_ENV=production`
- **THEN** the application SHALL start on the configured `PORT` and connect to Postgres via `DATABASE_URL`

### Requirement: Database backups
The deployment SHALL include a nightly `pg_dump` cron job sending backups to off-box storage.

#### Scenario: Nightly backup
- **WHEN** the backup cron fires at the scheduled time
- **THEN** a full `pg_dump` SHALL be created and uploaded to the configured storage target

### Requirement: Health check endpoint
The system SHALL expose a `/api/health` endpoint returning 200 when the application and database connection are healthy.

#### Scenario: Healthy system
- **WHEN** an uptime monitor hits `/api/health`
- **THEN** the endpoint SHALL return 200 with `{"status": "ok"}`

#### Scenario: Database unreachable
- **WHEN** the Postgres connection is down
- **THEN** `/api/health` SHALL return 503

### Requirement: Trial expiration cron
A daily cron job (systemd timer or `node-cron`) SHALL run `expireOverdueTrials()` to flip expired trials.

#### Scenario: Daily cron at 03:00
- **WHEN** the cron fires at 03:00 daily
- **THEN** all trials past `current_period_end` SHALL be set to `status='expired'`

### Requirement: Operator first-signup flow
The first user to sign up via Clerk SHALL be auto-promoted to operator. The deployment guide SHALL instruct the operator to sign up first before opening public access.

#### Scenario: Operator bootstraps the system
- **WHEN** the operator deploys and signs up as the first user
- **THEN** they SHALL have `is_operator=true` and access to `/dashboard/*`
