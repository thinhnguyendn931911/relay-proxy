## ADDED Requirements

### Requirement: User role accesses only SaaS self-service pages
Authenticated users with the `user` role SHALL be able to access SaaS self-service pages under `/app/*` and SHALL NOT be able to access original 9Router operator pages under `/dashboard/*`.

#### Scenario: User accesses keys page
- **WHEN** an authenticated user visits `/app/keys`
- **THEN** the page SHALL render normally

#### Scenario: User accesses usage page
- **WHEN** an authenticated user visits `/app/usage`
- **THEN** the page SHALL render normally

#### Scenario: User accesses plan page
- **WHEN** an authenticated user visits `/app/plan`
- **THEN** the page SHALL render normally

#### Scenario: User accesses docs page
- **WHEN** an authenticated user visits `/app/docs`
- **THEN** the page SHALL render normally

### Requirement: SaaS user APIs are own-account only
Authenticated users with the `user` role SHALL only access SaaS API resources that belong to their own Clerk user ID.

#### Scenario: User lists own keys
- **WHEN** an authenticated user calls `/api/saas/keys`
- **THEN** the response SHALL include only API keys owned by that user

#### Scenario: User reads own usage
- **WHEN** an authenticated user calls `/api/saas/usage`
- **THEN** the response SHALL include only usage records owned by that user

#### Scenario: User accesses another user's resource
- **WHEN** an authenticated user attempts to access a SaaS resource owned by a different user
- **THEN** the system SHALL return 403 or 404 and SHALL NOT disclose the other user's data
