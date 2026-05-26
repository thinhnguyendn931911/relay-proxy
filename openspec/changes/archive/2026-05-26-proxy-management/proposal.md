## Why

All provider accounts currently share a single proxy (or no proxy), which concentrates traffic on one IP address. AI providers detect and ban accounts that share the same IP pattern. Users need to assign distinct proxies to different accounts and quickly verify which proxies are still healthy.

## What Changes

- **Admin-only access**: Restrict all proxy pool management (CRUD, import, export, health check) to admin/operator users. Non-admin users must not see the proxy pools page or access proxy pool API endpoints.
- **Bulk export**: Add a "Bulk Export" button to the proxy pools dashboard that downloads all proxy URLs as a text file (one per line, same format accepted by batch import).
- **Auto-assignment hint**: Surface unassigned accounts (connections with no proxy pool bound) in the proxy pools page so operators can spot gaps quickly.
- **Export format**: `protocol://user:pass@host:port` — consistent with the existing batch import parser.

> Note: Proxy CRUD, batch import, per-connection binding, and health check (single + bulk) already exist in the codebase. This change adds the missing export capability and an unassigned-connections indicator.

## Capabilities

### New Capabilities
- `proxy-export`: Bulk export of proxy pool entries as a downloadable text file.
- `unassigned-connections-indicator`: Dashboard indicator showing how many provider connections have no proxy pool bound.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. -->

## Impact

- **UI**: `src/app/(dashboard)/dashboard/proxy-pools/page.js` — new export button and unassigned badge.
- **API**: New `GET /api/proxy-pools/export` endpoint (or client-side generation from existing data).
- **Dependencies**: None added.
- **Breaking changes**: None.
