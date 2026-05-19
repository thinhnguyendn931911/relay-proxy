## ADDED Requirements

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
