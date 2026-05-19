## Purpose

Define the admin/operator management surfaces for SaaS users, plans, and aggregate usage.
## Requirements
### Requirement: User management page
The `/dashboard/users` page SHALL list all users with status filters. Each user row SHALL link to a detail view showing keys, usage, and subscription. Operators SHALL be able to suspend, reactivate, override plan, and reset trial.

#### Scenario: Suspend a user
- **WHEN** an operator clicks "Suspend" on a user
- **THEN** the user's `status` SHALL be set to `suspended` and their API requests SHALL start returning 403

#### Scenario: Reactivate a user
- **WHEN** an operator clicks "Reactivate" on a suspended user
- **THEN** the user's `status` SHALL be set to `active`

#### Scenario: Override user plan
- **WHEN** an operator overrides a user's plan
- **THEN** the user's subscription SHALL be updated to the new plan, effective immediately

### Requirement: Plan editing page
The `/dashboard/plans` page SHALL allow operators to edit plan parameters: `monthly_token_cap`, `rpm_limit`, `price_cents`, `allowed_model_patterns`. Changes SHALL take effect immediately without redeployment.

#### Scenario: Edit plan token cap
- **WHEN** an operator changes the paid plan's `monthly_token_cap` to 5,000,000
- **THEN** the new cap SHALL be used for all subsequent quota checks against that plan

### Requirement: Aggregate usage dashboard
The `/dashboard/usage` page SHALL show total tokens consumed this month, total requests, top users by usage, and per-provider breakdown.

#### Scenario: View aggregate usage
- **WHEN** an operator visits `/dashboard/usage`
- **THEN** the page SHALL display aggregate metrics across all users for the current billing period

### Requirement: Admin-only 9Router operator surface
All original 9Router operator pages and operator APIs SHALL require the `admin` role. Authenticated users with the `user` role SHALL be forbidden from provider, combo, proxy pool, OAuth, usage aggregate, user-management, plan-management, settings, and local tooling actions.

#### Scenario: Admin accesses provider management
- **WHEN** an authenticated admin visits `/dashboard/providers`
- **THEN** the page SHALL render normally

#### Scenario: User accesses provider management
- **WHEN** an authenticated user visits `/dashboard/providers`
- **THEN** the system SHALL return 403

#### Scenario: User calls operator API
- **WHEN** an authenticated user calls an operator API such as `/api/providers`
- **THEN** the system SHALL return 403 and SHALL NOT perform the requested action

#### Scenario: Admin calls operator API
- **WHEN** an authenticated admin calls an operator API such as `/api/providers`
- **THEN** the system SHALL process the request subject to the route's existing validation

### Requirement: Admin-only user role management
Only admins SHALL be able to promote or demote SaaS users between admin and user roles.

#### Scenario: Admin changes a user role
- **WHEN** an authenticated admin changes another user's role
- **THEN** the target user's `is_operator` value SHALL be updated

#### Scenario: User attempts to change a role
- **WHEN** an authenticated user attempts to change any user's role
- **THEN** the system SHALL return 403 and SHALL NOT update `saas_users.is_operator`

