## Why

SaaS API route handlers currently mix HTTP concerns, validation, business rules, and database queries in `src/app/api/saas`, making features harder to extend without duplicating route-level logic. Refactoring these APIs into controllers, services, and data access establishes a stable pattern for upcoming SaaS feature work while preserving existing API behavior.

## What Changes

- Introduce a layered SaaS API structure with:
  - Controllers for Next.js route/request/response concerns.
  - Services for business rules, orchestration, authorization-facing decisions, and response shaping.
  - Data access modules for database adapter queries and persistence mapping.
- Move existing `src/app/api/saas` endpoint logic into the new layers without changing public endpoint paths, methods, status codes, or response payload shapes.
- Document the new structure as the expected convention for future SaaS API features.
- Keep shared authentication helpers usable from controllers or services without broadening access behavior.

## Capabilities

### New Capabilities
- `saas-api-layering`: Architectural contract for organizing SaaS APIs into controllers, services, and data access modules while preserving route behavior.

### Modified Capabilities

## Impact

- Affected code: `src/app/api/saas/**`, new SaaS API controller/service/data access modules under `src/lib` or an equivalent existing project convention.
- Affected APIs: SaaS API internals only; public SaaS API routes should remain behavior-compatible.
- Affected systems: SaaS dashboard/admin endpoints, user API key endpoints, plan endpoints, usage endpoints, and Clerk webhook handling.
- Dependencies: No new runtime dependency is expected.
