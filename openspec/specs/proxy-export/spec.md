## ADDED Requirements

### Requirement: Bulk export proxy pool entries

The system SHALL allow admin users to export all proxy pool entries as a downloadable text file. Non-admin users SHALL NOT have access to this functionality.

#### Scenario: Admin exports all proxies

- **WHEN** an authenticated admin user clicks the "Bulk Export" button on the proxy pools page
- **THEN** the system SHALL generate a text file containing one proxy URL per line using the format `protocol://user:pass@host:port`
- **AND** the browser SHALL trigger a file download named `proxy-pools-export-{YYYY-MM-DD}.txt`

#### Scenario: Export with mixed proxy types

- **WHEN** the proxy pool contains both HTTP proxies and Vercel relay entries
- **THEN** the export SHALL include only entries with a valid `proxyUrl` field
- **AND** each line SHALL contain the raw `proxyUrl` value as stored

#### Scenario: Export with empty pool

- **WHEN** the proxy pool has no entries
- **THEN** the "Bulk Export" button SHALL be disabled
- **AND** no file download SHALL be triggered

#### Scenario: Export round-trip with batch import

- **WHEN** an admin exports proxy pools from one instance and imports the file into another instance via batch import
- **THEN** the imported proxies SHALL match the original entries (protocol, host, port, credentials)

### Requirement: Admin-only access to proxy pool management

All proxy pool management operations (create, edit, delete, import, export, health check) SHALL be restricted to users with the admin/operator role. Non-admin users SHALL NOT see the proxy pools page or access proxy pool API endpoints.

#### Scenario: Non-admin attempts to access proxy pools page

- **WHEN** a non-admin authenticated user navigates to `/dashboard/proxy-pools`
- **THEN** the system SHALL deny access and redirect or display a forbidden message

#### Scenario: Non-admin attempts to call proxy pool API

- **WHEN** a non-admin user sends a request to any `/api/proxy-pools` endpoint
- **THEN** the system SHALL respond with HTTP 403 Forbidden
