# SaaS API layering

SaaS API routes under `src/app/api/saas` use three implementation layers:

- Controllers in `src/lib/saas/controllers` own Next.js request handling, route params, auth helpers, and `NextResponse` creation.
- Services in `src/lib/saas/services` own validation, business workflows, orchestration, and response DTO shaping.
- Data access modules in `src/lib/saas/data` and existing SaaS repos own database adapter calls, SQL, and persistence mapping.

New SaaS API features should keep route files as thin exports that delegate to a controller. Do not add business logic or direct SQL to `src/app/api/saas/**/route.js`.

## Current route inventory

| Route | Method | Auth | Inputs | Success response | Error responses |
| --- | --- | --- | --- | --- | --- |
| `/api/saas/keys` | `GET` | SaaS user | none | `{ keys }` | auth error |
| `/api/saas/keys` | `POST` | SaaS user | JSON `{ name }` | `201 { key }` | auth error, `400 { error: "Name is required" }` |
| `/api/saas/keys/[id]` | `DELETE` | SaaS user | route `id` | `{ ok: true }` | auth error, `404 { error: "Key not found" }` |
| `/api/saas/plan` | `GET` | SaaS user | none | `{ subscription, plan, usage }` | auth error |
| `/api/saas/plans` | `GET` | operator | none | `{ plans }` | auth error |
| `/api/saas/plans/[id]` | `PATCH` | operator | route `id`, plan JSON fields | `{ plan }` | auth error, `404 { error: "Plan not found" }`, `400 { error: "No fields to update" }` |
| `/api/saas/usage` | `GET` | SaaS user | none | `{ period, daily, recent }` | auth error |
| `/api/saas/usage-aggregate` | `GET` | operator | none | aggregate usage payload | auth error |
| `/api/saas/users` | `GET` | operator | query `status`, `q`, `page` | `{ users, total, page, pages }` | auth error |
| `/api/saas/users/[id]` | `GET` | operator | route `id` | user detail payload | auth error, `404 { error: "User not found" }` |
| `/api/saas/users/[id]` | `PATCH` | operator | route `id`, action JSON | action payload | auth error, `404 { error: "User not found" }`, action-specific errors |
| `/api/saas/clerk-webhook` | `POST` | Clerk Svix signature | raw webhook body | `{ ok: true }` or `{ ok: true, ignored: true }` | `500 { error: "missing_clerk_webhook_secret" }`, `400 { error: "invalid_signature" }` |
