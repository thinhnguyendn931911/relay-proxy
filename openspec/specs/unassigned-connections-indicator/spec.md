## ADDED Requirements

### Requirement: Display unassigned connection count

The proxy pools dashboard SHALL display a count of provider connections that have no proxy pool bound, so admin users can identify exposed accounts at a glance.

#### Scenario: Some connections are unassigned

- **WHEN** an admin views the proxy pools page and 5 out of 12 provider connections have no `proxyPoolId` set
- **THEN** the page SHALL display a badge or indicator showing "7 unassigned" (or equivalent)

#### Scenario: All connections have proxies

- **WHEN** every provider connection has a `proxyPoolId` bound
- **THEN** the unassigned indicator SHALL show "0 unassigned" or be hidden

#### Scenario: No connections exist

- **WHEN** there are no provider connections in the system
- **THEN** the unassigned indicator SHALL not be displayed

### Requirement: Unassigned count uses existing data

The unassigned connection count SHALL be derived from data already fetched by the proxy pools page (via the `includeUsage=true` query parameter) without requiring additional API calls. The API response SHALL include a `totalConnectionCount` field.

#### Scenario: API returns total connection count

- **WHEN** the proxy pools API is called with `includeUsage=true`
- **THEN** the response SHALL include a `totalConnectionCount` integer alongside the `proxyPools` array
