## 1. Role Resolution

- [x] 1.1 Add or extend a shared SaaS auth helper that resolves `admin` and `user` roles from Clerk user ID and `saas_users.is_operator`
- [x] 1.2 Return consistent 401 for unauthenticated requests and 403 for authenticated users without the required role
- [x] 1.3 Preserve legacy/non-Clerk behavior only when SaaS Clerk configuration is disabled

## 2. Admin-Only 9Router Access

- [x] 2.1 Gate `/dashboard/*` pages so only admin users can render original 9Router/operator content
- [x] 2.2 Gate original 9Router/operator API routes such as providers, combos, proxy pools, OAuth, usage, settings, CLI tools, and user/plan management to admin users
- [x] 2.3 Add admin-only role management for promoting or demoting users through the existing SaaS user-management path
- [x] 2.4 Verify direct URL and direct API attempts from user-role accounts return 403 without side effects

## 3. User-Only SaaS Scope

- [x] 3.1 Confirm authenticated user-role accounts can access `/app/keys`, `/app/usage`, `/app/plan`, and `/app/docs`
- [x] 3.2 Ensure `/api/saas/keys`, `/api/saas/usage`, and `/api/saas/plan` return only the authenticated user's own data
- [x] 3.3 Ensure user-role accounts cannot read or mutate another user's SaaS resources
- [x] 3.4 Keep admin accounts able to use SaaS self-service routes for their own account

## 4. Verification

- [x] 4.1 Add focused tests for admin dashboard/page access, user dashboard denial, and unauthenticated redirects or 401 responses
- [x] 4.2 Add focused tests for operator API denial for user-role accounts
- [x] 4.3 Add focused tests for SaaS own-account API scoping
- [x] 4.4 Run the relevant lint/test/build checks and record any known limitations
