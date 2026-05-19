## Why

Users hitting unauthorized or missing dashboard routes see raw JSON responses or blank pages instead of helpful error screens. Proper 403 and 404 pages improve UX by communicating the issue clearly and providing navigation back to valid routes.

## What Changes

- Add a Next.js `not-found.js` page to handle 404 errors across all UI routes
- Add a custom 403 Forbidden page component rendered when dashboard access is denied
- Update `dashboardGuard.js` middleware to redirect to the 403 page instead of returning JSON for non-API routes
- API routes (`/api/*`, `/v1/*`, `/v1beta/*`) remain unchanged — they continue returning JSON error responses

## Capabilities

### New Capabilities
- `error-pages`: Custom 403 and 404 error pages for browser-facing UI routes with clear messaging and navigation

### Modified Capabilities

_(none — API error responses are unchanged)_

## Impact

- New files: `src/app/not-found.js`, `src/app/forbidden/page.js` (or equivalent)
- Modified: `src/dashboardGuard.js` — conditional redirect for non-API 403 responses
- No API changes, no dependency additions, no breaking changes
