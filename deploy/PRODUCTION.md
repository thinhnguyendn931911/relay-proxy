# Production Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Caddy or nginx (TLS termination)
- Stripe account (for billing)
- Clerk account (for auth)

## 1. System Setup

```bash
# Create app user
sudo useradd -r -m -s /bin/bash relay

# Clone and install
sudo -u relay git clone <repo-url> /opt/relay-proxy
cd /opt/relay-proxy
sudo -u relay npm ci
```

## 2. Environment

Copy `.env.example` to `/opt/relay-proxy/.env` and set all required values:

```
DATABASE_URL=postgresql://relay:password@localhost:5432/relay_proxy
NODE_ENV=production
PORT=3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PAID_PRICE_ID=price_...
STRIPE_CUSTOMER_PORTAL_RETURN_URL=https://your-domain.com/app/plan
```

## 3. Database

```bash
sudo -u postgres createuser relay
sudo -u postgres createdb relay_proxy -O relay
```

Tables are auto-created on first startup.

## 4. Build and Start

```bash
cd /opt/relay-proxy
sudo -u relay npm run build
sudo -u relay npm run start
```

Or with systemd:

```bash
sudo cp deploy/relay-proxy.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relay-proxy
```

## 5. Reverse Proxy (Caddy)

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

## 6. Operator Bootstrap

**The first user to sign up becomes the operator.** Before opening public access:

1. Start the app
2. Navigate to your domain
3. Sign up with the operator's email via Clerk
4. Verify you can access `/dashboard`

Only then share the URL for end-user signups.

## 7. Cron Jobs

### Trial Expiration (daily at 03:00)

```bash
sudo cp deploy/expire-trials.service deploy/expire-trials.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now expire-trials.timer
```

### Database Backup (nightly at 02:00)

```bash
sudo cp deploy/pg-backup.service deploy/pg-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pg-backup.timer
```

Backups land in `/var/backups/relay-proxy/` with 7-day retention by default. Set `BACKUP_DIR` and `RETAIN_DAYS` in the env file to customize.

For off-box storage, add an upload step to `scripts/pg-backup.sh` (e.g., `rclone copy` to S3/B2).

## 8. Stripe Webhooks

In the Stripe dashboard, add a webhook endpoint:

- URL: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

## 9. Health Check

Monitor `https://your-domain.com/api/health` — returns 200 `{"status":"ok"}` when healthy, 503 when the database is unreachable.
