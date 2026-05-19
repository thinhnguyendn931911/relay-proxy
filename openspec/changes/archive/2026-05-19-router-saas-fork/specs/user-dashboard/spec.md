## ADDED Requirements

### Requirement: Keys management page
The `/app/keys` page SHALL allow users to list their API keys, create new keys, and revoke existing keys. New key plaintext SHALL be displayed once with a copy button.

#### Scenario: Create and copy key
- **WHEN** a user clicks "Create Key" and enters a name
- **THEN** the page SHALL display the `sk_user_…` plaintext once with a copy-to-clipboard button

#### Scenario: Revoke key
- **WHEN** a user clicks "Revoke" on a key
- **THEN** the key SHALL be soft-deleted and marked as revoked in the list

### Requirement: Usage dashboard page
The `/app/usage` page SHALL display a chart of daily token usage for the current billing period and a table of recent requests.

#### Scenario: View monthly usage
- **WHEN** a user visits `/app/usage`
- **THEN** the page SHALL show a daily bar/line chart of tokens consumed and a list of recent requests with model, tokens, and timestamp

### Requirement: Plan and subscription page
The `/app/plan` page SHALL display the user's current plan, subscription status, usage against limits, and an upgrade option.

#### Scenario: Trial user views plan
- **WHEN** a trial user visits `/app/plan`
- **THEN** the page SHALL show "Free Trial", days remaining, token usage vs cap, and an "Upgrade" button

#### Scenario: Paid user views plan
- **WHEN** a paid user visits `/app/plan`
- **THEN** the page SHALL show "Paid", token usage vs cap, and a link to Stripe Customer Portal for subscription management

### Requirement: Quick-start docs page
The `/app/docs` page SHALL provide setup instructions for pointing Cursor, Claude Code, and Cline at the SaaS endpoint with the user's API key.

#### Scenario: View docs
- **WHEN** a user visits `/app/docs`
- **THEN** the page SHALL display configuration snippets for popular AI clients with the base URL and placeholder for the user's key
