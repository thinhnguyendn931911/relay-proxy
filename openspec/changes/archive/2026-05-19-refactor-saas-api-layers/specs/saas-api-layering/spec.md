## ADDED Requirements

### Requirement: SaaS API routes use layered ownership
The system SHALL organize SaaS API implementation so HTTP route handlers delegate to controllers, controllers coordinate request and response concerns, services own business workflows, and data access modules own database queries.

#### Scenario: Route delegates to controller
- **WHEN** a SaaS endpoint under `src/app/api/saas` handles a request
- **THEN** the route handler SHALL delegate endpoint logic to a SaaS controller instead of embedding business workflow or database query logic directly in the route file

#### Scenario: Service avoids HTTP response construction
- **WHEN** a SaaS service completes a workflow
- **THEN** it SHALL return domain or DTO data for the controller to convert into the HTTP response

#### Scenario: Data access owns SQL
- **WHEN** SaaS data must be read or persisted
- **THEN** SQL statements and database adapter calls SHALL live in SaaS data access modules instead of controllers or route files

### Requirement: Refactor preserves existing SaaS API behavior
The layered refactor SHALL preserve existing public SaaS API route paths, HTTP methods, status codes, and response payload shapes unless a separate capability explicitly changes them.

#### Scenario: Existing endpoint behavior remains compatible
- **WHEN** a client calls an existing SaaS API endpoint after the refactor with the same authentication state and request data
- **THEN** the response status and payload shape SHALL match the pre-refactor behavior

#### Scenario: Existing authorization outcomes remain compatible
- **WHEN** a SaaS API endpoint rejects an unauthenticated, unauthorized, or non-operator request
- **THEN** the response status and error payload SHALL match the pre-refactor behavior

### Requirement: New SaaS API features follow the layered structure
Upcoming SaaS API features SHALL add endpoint behavior through the same controller, service, and data access layering rather than placing business or persistence logic directly in route handlers.

#### Scenario: New endpoint introduces business behavior
- **WHEN** a new SaaS API endpoint is added with validation, workflow, or persistence needs
- **THEN** the implementation SHALL place request/response handling in a controller, business workflow in a service, and database operations in data access modules

#### Scenario: New endpoint is HTTP-only
- **WHEN** a new SaaS API endpoint only adapts an existing service workflow to Next.js routing
- **THEN** the route handler SHALL remain a thin delegation layer and SHALL NOT duplicate service or data access logic
