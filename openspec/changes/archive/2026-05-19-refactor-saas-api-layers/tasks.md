## 1. Characterize Current Behavior

- [x] 1.1 Inventory all `src/app/api/saas/**/route.js` endpoints, methods, auth requirements, request inputs, status codes, and response payload shapes
- [x] 1.2 Identify existing test coverage for SaaS API routes and add focused characterization tests or checks for uncovered high-risk endpoints
- [x] 1.3 Confirm the chosen module naming convention for controllers, services, and data access under `src/lib/saas`

## 2. Add Layer Structure

- [x] 2.1 Create SaaS controller modules for existing route domains
- [x] 2.2 Create SaaS service modules for API key, plan, user admin, usage, subscription plan, and Clerk webhook workflows
- [x] 2.3 Create or extend SaaS data access modules so SQL and database adapter calls move out of route handlers and controllers
- [x] 2.4 Keep existing auth helpers reusable at the controller boundary without changing authorization outcomes

## 3. Refactor Existing Routes

- [x] 3.1 Refactor user API key routes to delegate to controllers, services, and data access while preserving responses
- [x] 3.2 Refactor plan and current-plan routes to delegate to controllers, services, and data access while preserving responses
- [x] 3.3 Refactor usage and usage aggregate routes to delegate to controllers, services, and data access while preserving responses
- [x] 3.4 Refactor operator user routes to delegate to controllers, services, and data access while preserving responses
- [x] 3.5 Refactor Clerk webhook route so signature verification stays at the HTTP boundary and event workflows move into services

## 4. Verify and Document Convention

- [x] 4.1 Run the relevant test suite and any targeted SaaS API checks
- [x] 4.2 Verify no SaaS route handler contains direct SQL or direct database adapter calls after the refactor
- [x] 4.3 Add or update lightweight developer documentation that future SaaS API features use controllers, services, and data access modules
- [x] 4.4 Run `openspec validate refactor-saas-api-layers --strict` and resolve any validation issues
