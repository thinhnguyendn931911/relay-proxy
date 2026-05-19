## ADDED Requirements

### Requirement: Per-user RPM sliding window
The system SHALL enforce a requests-per-minute limit per user based on their plan's `rpm_limit`. The limiter SHALL use a 60-second sliding window stored in memory.

#### Scenario: Under RPM limit
- **WHEN** a user with `rpm_limit=10` has made 9 requests in the last 60 seconds
- **THEN** the 10th request SHALL proceed

#### Scenario: RPM limit exceeded
- **WHEN** a user with `rpm_limit=10` has made 10 requests in the last 60 seconds
- **THEN** the 11th request SHALL return 429 with a `Retry-After` header indicating seconds until the oldest request exits the window

### Requirement: RPM check runs before quota check
The RPM limiter SHALL execute before the monthly token quota check in the guard chain, as it's cheaper to reject.

#### Scenario: Guard chain order
- **WHEN** a request enters the guard chain
- **THEN** the checks SHALL execute in order: key resolution → suspension check → RPM limit → model gate → monthly quota

### Requirement: Memory cleanup prevents unbounded growth
The rate limiter SHALL periodically prune expired entries from the in-memory bucket map (at least every 30 seconds) to prevent memory leaks from inactive users.

#### Scenario: Inactive user cleanup
- **WHEN** a user hasn't made requests for > 60 seconds
- **THEN** the next cleanup cycle SHALL remove their bucket from memory
