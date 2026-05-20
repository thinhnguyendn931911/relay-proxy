## Why

The root README still presents 9Router primarily as a local/free AI router even though the repository now contains a hosted SaaS product surface with Clerk auth, per-user API keys, usage quotas, Stripe billing, operator admin, and VPS deployment support. Updating the README will make the project entry point match the current product and reduce confusion for users, operators, and contributors.

## What Changes

- Reposition the root README around 9Router as a SaaS AI gateway product while preserving the core value proposition: routing AI coding tools to many providers with RTK token savings and fallback.
- Add a concise product overview covering end users, operators, and hosted deployment.
- Document SaaS capabilities already present in the app: Clerk authentication, user API keys, plan and quota enforcement, RPM limits, Stripe billing, usage dashboard, operator admin, Postgres, and production operations.
- Update quick-start and deployment guidance so local development, hosted SaaS setup, required environment variables, and first-operator bootstrap are clearly separated.
- Keep existing technical setup details that remain valid, but remove or rewrite messaging that says the product has no billing or is only a local proxy.

## Capabilities

### New Capabilities
- `readme-saas-positioning`: Requirements for the root README to present the current SaaS product accurately and guide users through local development and hosted operation.

### Modified Capabilities
<!-- No existing product behavior requirements change. This is a documentation-only change. -->

## Impact

- Affected documentation: `README.md`.
- Potentially affected localized documentation only if implementation chooses to keep translated READMEs in sync; the required scope is the root English README.
- No runtime code, APIs, database schema, dependencies, or tests should change.
