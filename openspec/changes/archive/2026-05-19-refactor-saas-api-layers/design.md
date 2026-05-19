## Context

The SaaS API surface under `src/app/api/saas` currently uses Next.js route handlers as the main place for auth checks, request parsing, validation, business branching, SQL queries, and response mapping. Some reusable SaaS data access already exists in `src/lib/saas/userRepo.js` and `src/lib/saas/subscriptionRepo.js`, but other routes still query through `getAdapter()` directly.

This change should preserve all public route paths and behavior while making the implementation easier to extend for upcoming SaaS features. The main stakeholders are dashboard users, operators using admin APIs, and future feature work that needs a clear place for HTTP, domain, and persistence logic.

## Goals / Non-Goals

**Goals:**

- Keep `src/app/api/saas/**/route.js` files as thin Next.js adapters.
- Introduce controllers for request parsing, auth invocation, route parameter handling, and `NextResponse` creation.
- Introduce services for SaaS business workflows, validation decisions, response DTO shaping, and orchestration across data access modules.
- Introduce or consolidate data access modules for SaaS SQL and database row mapping.
- Preserve existing endpoint URLs, HTTP methods, status codes, and response payload shapes.
- Establish the layered structure as the default pattern for new SaaS API endpoints.

**Non-Goals:**

- Redesigning SaaS API behavior, payload contracts, or authorization policy.
- Replacing the database adapter abstraction.
- Adding new SaaS product features.
- Refactoring non-SaaS API routes.
- Introducing a framework or dependency for controllers/services/repositories.

## Decisions

1. Use route handlers only as Next.js entry points.

   Route files should export `GET`, `POST`, `PATCH`, or `DELETE` and delegate immediately to a controller. This keeps Next.js-specific signatures and filesystem routing stable while moving testable logic out of `src/app/api/saas`.

   Alternative considered: keep controller functions inside route files. That would reduce file count, but it would not create a durable convention for future features.

2. Place reusable SaaS layers under `src/lib/saas`.

   Existing SaaS helpers already live under `src/lib/saas`, so new modules should follow that area instead of introducing a second root. A practical structure is:

   - `src/lib/saas/controllers/*Controller.js`
   - `src/lib/saas/services/*Service.js`
   - `src/lib/saas/data/*Data.js` or continued `*Repo.js` modules

   Alternative considered: create `src/server/saas` or `src/app/api/saas/_lib`. That would isolate API-only code, but it would split related SaaS domain code away from existing repos and auth helpers.

3. Keep authorization checks at the controller boundary unless a service operation needs a user/operator context.

   Controllers should call `requireSaasUser()` or `requireOperator()` for current HTTP endpoints and pass the resolved context into services. Services should not call Clerk directly, but they may enforce business-level permissions from the provided context if a workflow needs it.

   Alternative considered: move all auth into services. That centralizes policy, but it couples services to Next/Clerk request state and makes them harder to exercise directly.

4. Put SQL and row normalization in data access modules.

   Data access modules should own `getAdapter()` usage, SQL statements, persistence-specific naming, and row-to-domain/DTO normalization where it is purely persistence mapping. Services should consume functions with domain-oriented names.

   Alternative considered: let services query `getAdapter()` directly. That is simpler for one endpoint, but it repeats the current mixing problem as the API grows.

5. Refactor route groups incrementally with compatibility checks.

   Implement by endpoint domain, starting with lower-risk read endpoints or an already-partial domain, then moving write/admin/webhook flows. Each moved route should keep equivalent responses and error handling.

   Alternative considered: a single large rewrite. That can produce a clean final tree faster, but it increases regression risk across admin, billing, usage, and webhook paths.

## Risks / Trade-offs

- Behavior drift during extraction -> Add focused route/service tests or characterization checks for status codes and response shapes before or during each endpoint move.
- Too many thin files -> Keep modules grouped by SaaS domain rather than creating one file per tiny helper.
- Ambiguous ownership between service mapping and data mapping -> Data access maps database rows; services compose workflows and final response DTOs when multiple data sources are involved.
- Existing repos overlap with new data modules -> Reuse and extend existing `userRepo.js` and `subscriptionRepo.js` where they fit, and rename only when it is part of the smallest coherent implementation.
- Webhook signature handling is HTTP-specific -> Keep raw request body and Svix header extraction in the webhook controller; move event-specific actions into a service.

## Migration Plan

1. Add the layered folders/modules under `src/lib/saas` without changing route paths.
2. Extract shared response, validation, date/period, and normalization helpers only when reused by multiple endpoints.
3. Move one SaaS route group at a time into controller, service, and data access modules.
4. Run existing tests and add targeted coverage for moved endpoint behavior where coverage is missing.
5. Keep rollback simple: each route file can delegate back to its prior inline logic if an extracted domain causes regressions.

## Open Questions

- Should data access modules keep the existing `*Repo.js` naming, or should new modules use a dedicated `data/` folder? The implementation should choose the smallest style that keeps the codebase consistent.
- Are there existing API characterization tests not visible from the route files? If not, implementation should add focused tests around the highest-risk admin and webhook paths.
