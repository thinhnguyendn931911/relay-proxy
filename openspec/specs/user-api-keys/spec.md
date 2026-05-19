## ADDED Requirements

### Requirement: Users create API keys scoped to their account
The system SHALL allow authenticated users to create API keys prefixed with `sk_user_`. Keys SHALL be stored as HMAC hashes. The plaintext key SHALL be returned exactly once at creation time.

#### Scenario: Create new key
- **WHEN** a user creates a key with name "my-key"
- **THEN** the system SHALL return the plaintext `sk_user_…` key once, store only the HMAC hash with `userid` set to the creating user's ID

#### Scenario: Key never shown again
- **WHEN** a user lists their keys after creation
- **THEN** the system SHALL show key metadata (name, created date, last used) but NOT the plaintext key

### Requirement: Users list only their own keys
The key listing endpoint SHALL return only keys belonging to the authenticated user.

#### Scenario: User lists keys
- **WHEN** user A requests their key list
- **THEN** the system SHALL return only keys where `userid` matches user A's ID

### Requirement: Users revoke their own keys via soft delete
Key revocation SHALL set `revokedat` timestamp instead of deleting the row. Revoked keys SHALL be rejected on subsequent API requests.

#### Scenario: Revoke a key
- **WHEN** a user revokes key "key-123"
- **THEN** the `revokedat` column SHALL be set to the current timestamp

#### Scenario: Use revoked key
- **WHEN** a request uses a revoked API key
- **THEN** the system SHALL return 401 Unauthorized

### Requirement: Key resolution returns user context
A `findUserByKey(key)` function SHALL hash the provided key and look up the associated user, returning `{userId, user, plan, subscription}` or null for invalid/revoked keys.

#### Scenario: Valid key lookup
- **WHEN** `findUserByKey` is called with a valid, non-revoked key
- **THEN** it SHALL return the user ID and associated user record

#### Scenario: Revoked key lookup
- **WHEN** `findUserByKey` is called with a revoked key
- **THEN** it SHALL return null
