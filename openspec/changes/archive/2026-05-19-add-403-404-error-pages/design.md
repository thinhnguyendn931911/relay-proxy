## Context

The app uses Next.js App Router. Currently there are no `not-found.js` or error page components — all errors return JSON via `NextResponse.json()`. Dashboard routes redirect to `/login` on auth failure but local-only 403s return raw JSON. Users navigating to nonexistent UI routes get the default Next.js 404.

## Goals / Non-Goals

**Goals:**
- Render a styled 404 page for any unmatched UI route
- Render a styled 403 page when dashboard/UI access is forbidden
- Maintain JSON error responses for all API routes (`/api/*`, `/v1/*`, `/v1beta/*`)

**Non-Goals:**
- Changing API error response format
- Adding error pages for 401/500 or other status codes
- Custom error tracking or logging

## Decisions

### 404 Page: Next.js `not-found.js` convention

Use `src/app/not-found.js` — Next.js automatically renders this for unmatched routes and when `notFound()` is called.

**Why over a catch-all route**: Built-in framework convention, zero routing config, works with both static and dynamic routes.

### 403 Page: Dedicated `/forbidden` route with redirect

Create `src/app/forbidden/page.js`. Update `dashboardGuard.js` to redirect non-API 403 responses to `/forbidden` instead of returning JSON.

**Why redirect over rendering inline**: Middleware can't render components directly — it can only return responses or redirect. A dedicated route keeps the pattern simple and URL-visible.

**Why not `error.js` boundary**: Next.js error boundaries handle runtime errors, not HTTP status codes from middleware. They don't cover the 403 use case.

### Route detection in middleware

Check `pathname.startsWith("/api/")` or `isPublicLlmApi(pathname)` to distinguish API vs UI routes. API routes continue getting JSON; UI routes get redirected to `/forbidden`.

Currently only `LOCAL_ONLY_PATHS` in the middleware can produce 403 for non-API routes. The redirect applies there.

## Risks / Trade-offs

- **[Forbidden page is publicly accessible]** → Anyone can visit `/forbidden` directly. Acceptable — it's just an informational page with no sensitive content.
- **[Query param for context]** → Redirect to `/forbidden?reason=local-only` to show contextual messages. Risk of param tampering is low since the page is purely informational.
