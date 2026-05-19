## ADDED Requirements

### Requirement: Checkout session creation
The system SHALL provide a `POST /api/stripe/checkout-session` endpoint that creates a Stripe Checkout session for the paid plan and returns the session URL. The endpoint SHALL require Clerk authentication and pass the user's ID as client_reference_id.

#### Scenario: User initiates upgrade
- **WHEN** an authenticated trial user clicks "Upgrade" on `/app/plan`
- **THEN** the system SHALL create a Stripe Checkout session and redirect to the Stripe-hosted payment page

### Requirement: Webhook handles checkout completion
On `checkout.session.completed`, the system SHALL call `subscriptionRepo.upgradeToPaid(userId, stripeSubId, customerId)` to create/update the subscription with `status='active'` and the paid plan.

#### Scenario: Successful payment
- **WHEN** Stripe sends `checkout.session.completed` webhook
- **THEN** the user's subscription SHALL be updated to `status='active'`, `plan_id='plan_paid'`, with Stripe IDs stored

### Requirement: Webhook syncs subscription changes
On `customer.subscription.updated`, the system SHALL sync `current_period_start`, `current_period_end`, and `status`. On `customer.subscription.deleted`, the system SHALL set `status='canceled'`.

#### Scenario: Subscription renewed
- **WHEN** Stripe sends `customer.subscription.updated` with a new period
- **THEN** `current_period_start` and `current_period_end` SHALL be updated, and `saas_usage_periods` for the new month starts fresh

#### Scenario: User cancels subscription
- **WHEN** Stripe sends `customer.subscription.deleted`
- **THEN** the subscription `status` SHALL be set to `canceled` and service continues until `current_period_end`

### Requirement: Webhook handles payment failure
On `invoice.payment_failed`, the system SHALL set the subscription `status` to `past_due`.

#### Scenario: Payment fails
- **WHEN** Stripe sends `invoice.payment_failed`
- **THEN** the subscription `status` SHALL be `past_due` and API requests SHALL be blocked

### Requirement: Stripe webhook signature verification
All Stripe webhook requests SHALL be verified using the `STRIPE_WEBHOOK_SECRET` before processing.

#### Scenario: Invalid webhook signature
- **WHEN** a Stripe webhook arrives with an invalid signature
- **THEN** the handler SHALL return 400 and not process the event

### Requirement: Customer portal access
The `/app/plan` page SHALL provide a link to the Stripe Customer Portal for paid users to manage their subscription (cancel, update payment method).

#### Scenario: Paid user manages subscription
- **WHEN** a paid user clicks "Manage Subscription" on `/app/plan`
- **THEN** the system SHALL redirect to Stripe Customer Portal
