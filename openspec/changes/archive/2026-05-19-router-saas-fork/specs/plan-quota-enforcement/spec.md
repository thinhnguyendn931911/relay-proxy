## ADDED Requirements

### Requirement: Monthly token cap enforcement
The system SHALL check the user's total tokens consumed in the current month against their plan's `monthly_token_cap`. When the cap is exceeded, the system SHALL return 429 with rate-limit headers.

#### Scenario: Under monthly cap
- **WHEN** a user with 40,000 of 50,000 tokens used makes a request
- **THEN** the request SHALL proceed normally

#### Scenario: Monthly cap exceeded
- **WHEN** a user has consumed >= their plan's `monthly_token_cap`
- **THEN** the system SHALL return 429 with headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Reset` (unix timestamp of month end), `Retry-After` (seconds until month end)

### Requirement: Model gating by plan
The system SHALL check the requested model against `plan.allowed_model_patterns`. An empty patterns array means all models are allowed. Pattern matching SHALL use glob-style (e.g., `kr/*` matches `kr/model-name`).

#### Scenario: Free-tier user requests allowed model
- **WHEN** a trial user requests model `kr/some-model` and plan has `allowed_model_patterns: ["kr/*", "oc/*", "vertex/*"]`
- **THEN** the request SHALL proceed

#### Scenario: Free-tier user requests gated model
- **WHEN** a trial user requests model `cc/claude-opus-4-7` and plan only allows `["kr/*", "oc/*", "vertex/*"]`
- **THEN** the system SHALL return 403 with `{"error": "model_not_in_plan", "upgrade_url": "/app/plan"}`

#### Scenario: Paid user requests any model
- **WHEN** a paid user requests any model and plan has `allowed_model_patterns: []`
- **THEN** the request SHALL proceed (empty array = all allowed)

### Requirement: Subscription status validation
The system SHALL verify the user's subscription status before allowing requests. Requests SHALL be blocked for `canceled`, `expired`, and `past_due` statuses.

#### Scenario: Active subscription
- **WHEN** a user has subscription `status='active'`
- **THEN** requests SHALL proceed to quota/model checks

#### Scenario: Expired trial
- **WHEN** a user has subscription `status='expired'`
- **THEN** the system SHALL return 403 with `{"error": "subscription_expired", "upgrade_url": "/app/plan"}`

### Requirement: New users auto-provisioned with trial
On user creation (Clerk webhook), the system SHALL create a subscription with `status='trialing'`, `plan_id='plan_free_trial'`, and `current_period_end = NOW() + 14 days`.

#### Scenario: New user gets trial
- **WHEN** a new user signs up via Clerk
- **THEN** a `saas_subscriptions` row SHALL be created with `status='trialing'` and period end 14 days from now

### Requirement: Trial expiration cron
A daily job SHALL flip `status='expired'` for all subscriptions where `status='trialing'` and `current_period_end < NOW()`.

#### Scenario: Trial expires
- **WHEN** a trial subscription's `current_period_end` passes
- **THEN** the next cron run SHALL set `status='expired'`

### Requirement: Plans are operator-tunable at runtime
Plan values (`monthly_token_cap`, `rpm_limit`, `price_cents`, `allowed_model_patterns`) SHALL be read from `saas_plans` table, not hard-coded. Operators SHALL be able to update plans via the admin UI without redeployment.

#### Scenario: Operator increases token cap
- **WHEN** the operator changes `monthly_token_cap` for the paid plan from 2,500,000 to 5,000,000
- **THEN** subsequent quota checks for paid users SHALL use 5,000,000 as the cap
