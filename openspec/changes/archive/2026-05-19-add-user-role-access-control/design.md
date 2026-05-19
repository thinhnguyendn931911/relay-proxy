## Context

The SaaS fork already uses Clerk for identity and stores application authorization state in `saas_users`. The current model has `is_operator`, which protects some operator/admin flows, while the UI is split between original 9Router dashboard routes under `/dashboard/*` and SaaS user routes under `/app/*`.

The requested feature is role-based access with two product roles: admin and user. Admin users can access the original 9Router/operator pages. User-role accounts can access only the SaaS self-service router pages for their own account.

## Goals / Non-Goals

**Goals:**

- Define a single authorization rule for admin-only 9Router/dashboard pages and APIs.
- Keep user-role accounts limited to SaaS self-service routes and own-user data.
- Reuse existing Clerk authentication and `saas_users.is_operator` state as the role source.
- Apply checks consistently for direct page visits and API calls.
- Preserve first-user admin bootstrap behavior.

**Non-Goals:**

- Add a full multi-role permission system beyond `admin` and `user`.
- Change subscription, plan, quota, or billing behavior.
- Redesign the dashboard or user app navigation.
- Introduce a new auth provider.

## Decisions

### D1: Map product roles onto existing storage

Use `saas_users.is_operator=true` as the admin role and `is_operator=false` as the user role.

Why: the database, webhook bootstrap, and existing admin checks already use this field. A new `role` column would add migration and synchronization work without changing the requested access model.

Alternative considered: add a `role` enum column. This is more flexible but unnecessary for a two-role model and creates compatibility work across existing queries.

### D2: Centralize role authorization helpers

Extend the existing SaaS route authorization helpers so page loaders and API handlers can ask for admin or authenticated SaaS user access through one shared path.

Why: duplicated role checks drift quickly, especially across Next.js route handlers, layouts, and server components. A small shared helper keeps forbidden behavior consistent.

Alternative considered: inline checks in each route. This is simpler per file but more error-prone across the broad dashboard surface.

### D3: Deny dashboard and operator APIs by role, not by navigation

Protect `/dashboard/*` pages and original 9Router/operator APIs at request time. Hiding navigation items is helpful but not sufficient.

Why: users can access URLs and APIs directly. Authorization must be enforced before route content or side effects run.

Alternative considered: rely on layout navigation and client redirects. This leaves direct URL and API paths exposed.

### D4: Keep SaaS self-service access account-scoped

Allow authenticated user-role accounts to use `/app/*` and `/api/saas/*` routes only for their own keys, usage, plan, and docs. Admin accounts may access these routes for their own account, but admin-management of other users remains under admin-only APIs.

Why: this keeps SaaS user behavior predictable and prevents normal users from reading or mutating another tenant's state.

Alternative considered: forbid admins from `/app/*`. That would make admin testing and self-service billing awkward without improving isolation.

## Risks / Trade-offs

- Existing public allow-lists may bypass role checks for some `/api/saas/*` routes -> audit each route and require either authenticated own-user access or admin access.
- Legacy non-Clerk/local mode may not have a SaaS user record -> keep existing legacy behavior only where SaaS/Clerk is disabled, and require roles when Clerk is configured.
- Route-group coverage can miss pages outside `/dashboard/*` or `/app/*` -> scan app routes and add explicit tests for any dashboard aliases.
- Admin terminology may conflict with existing operator naming -> document that admin is the product role and maps to the existing operator flag.
