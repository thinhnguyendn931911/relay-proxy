## ADDED Requirements

### Requirement: All /v1 requests require a user API key
The system SHALL always require a valid API key on every `/v1/*` request. The `settings.requireApiKey` toggle SHALL be removed (always true).

#### Scenario: Request without API key
- **WHEN** a `/v1/chat/completions` request arrives without an `Authorization` header
- **THEN** the system SHALL return 401 with `{"error": "api_key_required"}`

#### Scenario: Request with invalid key
- **WHEN** a request uses a key that doesn't match any stored hash
- **THEN** the system SHALL return 401 with `{"error": "invalid_api_key"}`

### Requirement: Requests resolve to user identity
On every `/v1/*` request, the system SHALL resolve the API key to a user via `resolveApiKeyToUser`. The resolved `userId` SHALL be passed through the entire request pipeline.

#### Scenario: Valid key resolves to user
- **WHEN** a request uses a valid `sk_user_…` key
- **THEN** the system SHALL resolve the key to `{userId, user, plan, subscription}` and proceed

### Requirement: Suspended users are blocked
If the resolved user has `status='suspended'`, the system SHALL return 403.

#### Scenario: Suspended user makes request
- **WHEN** a user with `status='suspended'` makes a `/v1/*` request
- **THEN** the system SHALL return 403 with `{"error": "account_suspended"}`

### Requirement: Usage records carry userId
Every usage record written to `usageHistory` SHALL include the `userid` of the requesting user. The system SHALL also UPSERT into `saas_usage_periods` to increment the user's monthly counter atomically.

#### Scenario: Usage recorded after successful request
- **WHEN** a `/v1/chat/completions` request completes successfully
- **THEN** `usageHistory` SHALL contain a row with the user's `userid`, and `saas_usage_periods` SHALL be incremented for the current month

### Requirement: All /v1 entry points are tenant-aware
The tenant resolution and usage tracking SHALL apply to all `/v1/*` handlers: chat, embeddings, image generation, TTS, STT, search, and fetch.

#### Scenario: Embeddings request tracked
- **WHEN** a user makes a `/v1/embeddings` request
- **THEN** the request SHALL go through the same key resolution, user checks, and usage recording as chat requests
