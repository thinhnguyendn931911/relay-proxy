## ADDED Requirements

### Requirement: 404 page for unmatched UI routes
The system SHALL render a styled 404 Not Found page when a user navigates to a UI route that does not exist. The page MUST display a clear "Page Not Found" message and provide a link to navigate back to the homepage or dashboard.

#### Scenario: User navigates to a nonexistent UI path
- **WHEN** a user navigates to a path like `/nonexistent-route` that has no matching page
- **THEN** the system renders the custom 404 page with a "Page Not Found" heading, a brief explanation, and a link to the homepage

#### Scenario: API routes still return JSON 404
- **WHEN** an API request is made to a nonexistent `/api/*` endpoint
- **THEN** the system returns a JSON response with status 404 (not the HTML error page)

### Requirement: 403 page for forbidden UI access
The system SHALL render a styled 403 Forbidden page when a user attempts to access a UI route they are not permitted to view. The page MUST display a clear "Access Denied" message and provide navigation options.

#### Scenario: Local-only route accessed without CLI token
- **WHEN** a user without a valid CLI token navigates to a path guarded by `LOCAL_ONLY_PATHS` via browser
- **THEN** the system redirects to `/forbidden` and renders the 403 page with an "Access Denied" message

#### Scenario: API routes still return JSON 403
- **WHEN** an API request hits a 403 condition on `/api/*` or `/v1/*` routes
- **THEN** the system returns a JSON response with status 403 (not a redirect)

### Requirement: Error pages match application styling
Both the 403 and 404 pages SHALL use the application's existing layout and styling conventions so they feel consistent with the rest of the UI.

#### Scenario: Error pages use root layout
- **WHEN** either error page is rendered
- **THEN** the page renders within the root layout and uses the application's global CSS
