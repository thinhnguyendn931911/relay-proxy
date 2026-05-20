## Context

The root README currently opens with 9Router as a free local AI router and token saver. That message conflicts with the implemented SaaS product surface: authenticated user dashboard, per-user API keys, plan quotas, RPM limits, Stripe billing, operator admin, Postgres-backed multi-tenancy, and production deployment guidance.

This change is documentation-only. The README should become the product entry point for a hosted SaaS AI gateway while still acknowledging the underlying router features that make the product useful.

## Goals / Non-Goals

**Goals:**
- Present 9Router as a SaaS AI gateway for AI coding tools.
- Describe the product in terms of user outcomes: connect tools, generate user keys, route to providers, save tokens, enforce usage, and manage billing.
- Separate local development setup from hosted SaaS deployment.
- Preserve accurate technical details for supported providers, OpenAI-compatible endpoint usage, Postgres, Clerk, Stripe, and operator bootstrap.
- Remove or rewrite README claims that contradict the SaaS product.

**Non-Goals:**
- Change application behavior, pricing logic, provider routing, billing implementation, or database schema.
- Rewrite localized READMEs unless explicitly requested during implementation.
- Add new marketing pages, screenshots, assets, or generated visuals.
- Invent product capabilities that are not already represented in code or OpenSpec specs.

## Decisions

- Update only the root English README as the required artifact.
  - Rationale: The user asked for the README file, and the root README is the canonical project entry point.
  - Alternative considered: Update all localized READMEs. That is larger, more translation-sensitive, and unnecessary for this scoped change.

- Structure the README around product audiences and setup paths.
  - Rationale: End users, operators, and contributors need different first actions. Separating SaaS usage, local development, and production deployment reduces setup ambiguity.
  - Alternative considered: Keep the current local-router structure and add a SaaS section. That leaves conflicting first impressions and buries the current product.

- Describe billing, quotas, and authentication as existing SaaS capabilities, not future roadmap.
  - Rationale: The archived SaaS change marks these tasks complete, and active specs exist for the related capabilities.
  - Alternative considered: Use tentative language. That would understate the current product and fail to satisfy the requested repositioning.

- Keep implementation instructions concrete but concise.
  - Rationale: The README should remain usable as a quick start, not become a full operations manual.
  - Alternative considered: Move every deployment and environment detail into the README. That risks making the product overview hard to scan.

## Risks / Trade-offs

- README may drift from localized files → Scope the required update to `README.md` and leave translated README sync as optional follow-up.
- Product claims could overstate current behavior → Tie SaaS claims to implemented specs and existing routes/configuration.
- Removing local/free-router messaging could alienate existing users → Keep the core router, RTK, fallback, and local development value proposition, but make it subordinate to the SaaS product framing.
- Long README may remain hard to scan → Prefer a product-first top section, compact capability matrix, and clear setup subsections.
