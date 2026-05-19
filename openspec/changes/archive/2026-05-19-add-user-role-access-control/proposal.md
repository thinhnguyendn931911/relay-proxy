## Why

The SaaS fork needs explicit role separation so regular users cannot reach the original 9Router operator surface. This protects provider, combo, usage, and user-management pages while keeping the SaaS self-service app available to authenticated users.

## What Changes

- Introduce a clear user role model with `admin` and `user` behavior mapped onto the existing SaaS user record.
- Restrict all original 9Router/dashboard pages and operator APIs to admin users only.
- Allow regular users to access only the SaaS application routes and APIs needed for their own keys, usage, plan, and docs.
- Ensure admins can still access SaaS routes when useful, but users cannot access admin-only pages by direct URL or API calls.
- Return a consistent forbidden response for authenticated users who lack the required role.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `clerk-auth`: define role-based route and API authorization after Clerk authentication.
- `operator-admin`: require admin role for all 9Router/operator pages and actions.
- `user-dashboard`: ensure user role access remains limited to SaaS self-service pages and own-user data.

## Impact

- Affected code includes route middleware/guards, SaaS role lookup helpers, dashboard layouts, admin API handlers, and user-facing SaaS API handlers.
- Existing Clerk authentication and `saas_users` persistence remain the source of identity and authorization state.
- Tests should cover authenticated admin access, authenticated user access, direct URL attempts, and API authorization for both dashboard and SaaS surfaces.
