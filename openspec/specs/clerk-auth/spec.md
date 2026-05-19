## Purpose

Define Clerk-backed authentication, user synchronization, and role-based route access for SaaS and dashboard surfaces.
## Requirements
### Requirement: Clerk protects user and operator routes
The system SHALL use Clerk middleware to require authentication on `/app/*` and `/dashboard/*` routes. Unauthenticated requests SHALL be redirected to Clerk's sign-in page.

#### Scenario: Unauthenticated access to user area
- **WHEN** an unauthenticated user visits `/app/keys`
- **THEN** they SHALL be redirected to the Clerk sign-in page

#### Scenario: Authenticated access to user area
- **WHEN** an authenticated user visits `/app/keys`
- **THEN** the page SHALL render normally

### Requirement: Webhook creates saas_users record
On receiving a `user.created` Clerk webhook event, the system SHALL upsert a row into `saas_users` with the Clerk user ID and email. The webhook handler SHALL verify the Svix signature before processing.

#### Scenario: New user signup
- **WHEN** Clerk sends a `user.created` webhook with valid signature
- **THEN** a `saas_users` row SHALL be created with `status='active'` and `is_operator=false`

#### Scenario: Invalid webhook signature
- **WHEN** a webhook request arrives with an invalid Svix signature
- **THEN** the handler SHALL return 400 and not modify the database

### Requirement: First user auto-promoted to operator
When processing a `user.created` webhook, if `saas_users` table is empty, the new user SHALL be created with `is_operator=true`.

#### Scenario: First signup on fresh system
- **WHEN** the first `user.created` webhook fires and `saas_users` has zero rows
- **THEN** the user SHALL be created with `is_operator=true`

#### Scenario: Subsequent signup
- **WHEN** a `user.created` webhook fires and `saas_users` already has rows
- **THEN** the user SHALL be created with `is_operator=false`

### Requirement: Operator-only dashboard gating
The `/dashboard/*` routes SHALL only be accessible to users with the `admin` role, where `admin` maps to `saas_users.is_operator = true`. Non-admin authenticated users SHALL receive a 403 response.

#### Scenario: Admin accesses dashboard
- **WHEN** an authenticated user with `is_operator=true` visits `/dashboard/providers`
- **THEN** the page SHALL render normally

#### Scenario: User accesses dashboard
- **WHEN** an authenticated user with `is_operator=false` visits `/dashboard/providers`
- **THEN** the system SHALL return 403

#### Scenario: User accesses dashboard by direct URL
- **WHEN** an authenticated user with `is_operator=false` visits any `/dashboard/*` URL directly
- **THEN** the system SHALL return 403 before rendering dashboard content

### Requirement: Webhook syncs user updates and deletions
On `user.updated`, the system SHALL sync the email. On `user.deleted`, the system SHALL set `status='suspended'` (not hard-delete) to preserve usage history.

#### Scenario: User deleted in Clerk
- **WHEN** Clerk sends a `user.deleted` webhook
- **THEN** the `saas_users` row SHALL be updated to `status='suspended'`

### Requirement: Old password login removed
The old 9Router single-password login flow SHALL be removed. Clerk SHALL be the sole authentication mechanism.

#### Scenario: Old login page
- **WHEN** a user navigates to the old login URL
- **THEN** the system SHALL redirect to Clerk sign-in (or return 404)

### Requirement: Authenticated users have application roles
The system SHALL derive an authenticated user's application role from `saas_users`: `is_operator=true` maps to `admin`, and `is_operator=false` maps to `user`.

#### Scenario: Admin role resolved
- **WHEN** an authenticated Clerk user has `saas_users.is_operator=true`
- **THEN** the system SHALL authorize them as an `admin`

#### Scenario: User role resolved
- **WHEN** an authenticated Clerk user has `saas_users.is_operator=false`
- **THEN** the system SHALL authorize them as a `user`

#### Scenario: Missing SaaS user row
- **WHEN** an authenticated Clerk user has no matching `saas_users` row
- **THEN** the system SHALL deny role-protected SaaS and dashboard access

