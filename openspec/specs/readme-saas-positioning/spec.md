# readme-saas-positioning Specification

## Purpose
Define how the root README presents 9Router as a SaaS AI gateway while preserving accurate setup, routing, billing, and operations guidance.
## Requirements
### Requirement: README positions 9Router as a SaaS AI gateway
The root README SHALL present 9Router as a SaaS AI gateway product for AI coding tools and SHALL preserve the core value proposition of model routing, RTK token savings, provider fallback, and OpenAI-compatible client configuration.

#### Scenario: Reader opens the README
- **WHEN** a reader views the first product overview section of `README.md`
- **THEN** the README SHALL identify 9Router as a SaaS AI gateway and summarize how it connects AI coding tools to providers with token savings and fallback.

#### Scenario: Existing router value remains visible
- **WHEN** a reader scans the key capabilities in `README.md`
- **THEN** the README SHALL still mention RTK token savings, provider routing, auto fallback, and OpenAI-compatible endpoint usage.

### Requirement: README documents SaaS user capabilities
The root README SHALL document the SaaS user workflow: sign in, create user-scoped API keys, configure AI tools, monitor usage, understand plan limits, and upgrade or manage billing.

#### Scenario: End user follows the README
- **WHEN** an end user reads the SaaS usage or quick-start guidance
- **THEN** the README SHALL tell them where to sign in, where to manage API keys, how to configure a client endpoint, and where to view usage and plan status.

#### Scenario: Billing capabilities are described
- **WHEN** a reader reviews plan and billing information
- **THEN** the README SHALL mention Stripe-backed checkout or customer portal behavior without claiming billing is absent.

### Requirement: README documents operator capabilities
The root README SHALL document operator-facing capabilities including user administration, plan editing, aggregate usage views, first-operator bootstrap, and production health or maintenance expectations.

#### Scenario: Operator prepares a hosted deployment
- **WHEN** an operator reads the deployment or operations sections
- **THEN** the README SHALL identify required SaaS services and configuration areas including Postgres, Clerk, Stripe, environment variables, health checks, and first-signup operator bootstrap.

#### Scenario: Operator reviews admin features
- **WHEN** an operator scans product capabilities
- **THEN** the README SHALL mention operator admin for users, plans, usage, and account controls.

### Requirement: README separates local development from hosted SaaS deployment
The root README SHALL clearly separate local development instructions from production SaaS deployment instructions.

#### Scenario: Developer runs the app locally
- **WHEN** a developer follows the local development instructions
- **THEN** the README SHALL provide source setup commands and identify local URLs without requiring the reader to infer production SaaS steps.

#### Scenario: Operator deploys the SaaS product
- **WHEN** an operator follows production guidance
- **THEN** the README SHALL describe the hosted stack at a high level, including Node/Next.js, Postgres, Clerk, Stripe, reverse proxy/TLS, and backups or maintenance.

### Requirement: README avoids obsolete local-only messaging
The root README SHALL remove or rewrite claims that contradict the SaaS product, including statements that 9Router has no billing system or is only a local proxy.

#### Scenario: Reader searches for billing statements
- **WHEN** a reader searches `README.md` for billing or pricing language
- **THEN** the README SHALL not claim that 9Router cannot bill users or has no billing system.

#### Scenario: Reader searches for product scope
- **WHEN** a reader searches `README.md` for local-only positioning
- **THEN** any local proxy language SHALL be framed as one supported development or routing mode rather than the complete product identity.
