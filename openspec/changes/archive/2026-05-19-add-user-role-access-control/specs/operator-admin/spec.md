## ADDED Requirements

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
