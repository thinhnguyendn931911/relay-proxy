# landing-page-conversion Specification

## Purpose
Define the public Relay AI homepage, endpoint-plan conversion flow, and related user-facing plan upgrade presentation.
## Requirements
### Requirement: Public homepage sells one endpoint
The root homepage SHALL present Relay AI as an easy-to-use OpenAI-compatible endpoint product with one base URL, one API key, and simple plan tiers.

#### Scenario: Visitor opens homepage
- **WHEN** a visitor opens `/`
- **THEN** the first viewport shows the Relay AI product name, an ease-of-use value proposition, and calls to action for account access

#### Scenario: Visitor expects public marketing page
- **WHEN** a visitor opens `/`
- **THEN** the app shows the public marketing homepage instead of immediately redirecting to `/dashboard`

#### Scenario: Visitor evaluates setup effort
- **WHEN** a visitor reads the hero and product sections
- **THEN** the page explains that setup requires copying one endpoint URL, adding one API key, and sending requests

### Requirement: Header adapts to authentication state
The homepage header SHALL show public authentication actions to signed-out users and user account actions to signed-in users.

#### Scenario: Signed-out visitor sees auth actions
- **WHEN** a signed-out visitor opens `/`
- **THEN** the header shows "Sign in" and "Sign up" actions

#### Scenario: Signed-in user sees account actions
- **WHEN** a signed-in user opens `/`
- **THEN** the header shows an API keys shortcut and a user menu/avatar control

### Requirement: Endpoint base URL is configurable
The homepage SHALL display the endpoint base URL from public environment configuration, with a local fallback.

#### Scenario: Endpoint URL is configured
- **WHEN** `NEXT_PUBLIC_ENDPOINT_BASE_URL` is set
- **THEN** the homepage displays that value as the base URL

#### Scenario: Endpoint URL is not configured
- **WHEN** `NEXT_PUBLIC_ENDPOINT_BASE_URL` is absent
- **THEN** the homepage derives the base URL from `NEXT_PUBLIC_BASE_URL` with `/v1` appended

### Requirement: Plan tier promotion
The homepage SHALL promote the free trial and paid plan tiers with clear usage limits.

#### Scenario: Visitor reviews free trial
- **WHEN** a visitor reviews the plan section
- **THEN** the page shows a free trial tier with 50,000 monthly tokens and 10 requests per minute

#### Scenario: Visitor reviews paid tier
- **WHEN** a visitor reviews the plan section
- **THEN** the page highlights the paid tier with $10 per month, 2,500,000 monthly tokens, and 60 requests per minute

### Requirement: User plan page promotes paid upgrade
The `/app/plan` page SHALL show free or trial users what they receive by upgrading to the paid plan.

#### Scenario: Free or trial user views plan
- **WHEN** a non-paid user opens `/app/plan`
- **THEN** the page shows a paid upgrade card with price, monthly token cap, request-per-minute limit, model access, and a single upgrade action

#### Scenario: Paid user views plan
- **WHEN** a paid user opens `/app/plan`
- **THEN** the page does not show the paid upgrade card

### Requirement: Responsive and accessible presentation
The homepage and user app header SHALL render professionally across desktop and mobile viewports with readable text, usable controls, and no layout-breaking overlaps.

#### Scenario: Visitor opens desktop viewport
- **WHEN** the homepage renders on a desktop viewport
- **THEN** sections are visually polished, scannable, and free of incoherent text or element overlap

#### Scenario: Visitor opens mobile viewport
- **WHEN** the homepage renders on a mobile viewport
- **THEN** content fits within the viewport, CTAs remain tappable, and text remains readable

#### Scenario: User scrolls app pages
- **WHEN** a user scrolls `/app/keys` or another `/app/*` page
- **THEN** the user app header remains sticky at the top of the viewport
