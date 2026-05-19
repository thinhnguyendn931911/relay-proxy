## ADDED Requirements

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

## MODIFIED Requirements

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
