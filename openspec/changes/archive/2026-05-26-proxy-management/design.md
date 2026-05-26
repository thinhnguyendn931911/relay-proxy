## Context

The relay-proxy already has a full proxy pool system: CRUD, batch import, per-connection binding via `proxyPoolId` in `providerSpecificData`, health check (single + bulk with 10-concurrency workers), and Vercel relay deployment. The proxy pools page (`/dashboard/proxy-pools`) and API (`/api/proxy-pools`) are mature.

Two gaps remain:
1. No way to **export** proxy lists — operators who rotate proxies across environments need to extract their pool.
2. No visibility into **unassigned connections** — operators can't tell at a glance which accounts are exposed (running without a proxy).

## Goals / Non-Goals

**Goals:**
- Add bulk export of proxy URLs as a downloadable text file
- Show an indicator of how many provider connections have no proxy pool bound
- Zero new dependencies

**Non-Goals:**
- Changing the proxy data model or DB schema
- Adding proxy rotation or auto-assignment logic
- Modifying how the runtime resolves proxies for outbound requests
- Adding SOCKS5 as a first-class type (existing `proxyUrl` field already accepts any URL scheme)

## Decisions

### 1. Client-side export generation vs. server-side endpoint

**Decision**: Client-side generation from already-fetched data.

**Rationale**: The proxy pools list is already loaded client-side with `fetchProxyPools()`. Generating a blob and triggering a download avoids a new API route. Proxy credentials are already present in the client state (the existing page displays `pool.proxyUrl`). No server round-trip needed.

**Alternative considered**: `GET /api/proxy-pools/export` — adds an endpoint for data already available. Only justified if export needed from CLI or automation, which isn't a stated requirement.

### 2. Export format

**Decision**: One proxy URL per line, matching the batch import format (`protocol://user:pass@host:port`). Use the raw `proxyUrl` field.

**Rationale**: Round-trip compatibility — export then re-import on another instance works without transformation.

### 3. Unassigned connections indicator

**Decision**: Add a badge to the proxy pools page header showing "X unassigned" connections. Fetch connection data from the existing `/api/proxy-pools?includeUsage=true` response (which already loads all connections to compute `boundConnectionCount`).

**Rationale**: The API already returns enriched data. Computing unassigned count is subtraction: `totalConnections - sum(boundConnectionCount unique pools)`. No new API call needed — extend the existing response to include `totalConnectionCount`.

**Alternative considered**: Separate `/api/providers?unassigned=true` call — adds latency for data the page already has context to compute.

## Risks / Trade-offs

- **Credential exposure in export file**: Export contains plaintext proxy credentials. → Mitigation: This is intentional (operators need the full URL to re-import). The file stays local. Matches existing behavior where `proxyUrl` is visible in the UI.
- **Large pool lists**: If an operator has thousands of proxies, client-side blob generation could lag. → Mitigation: Unlikely in practice; proxy pools are typically <500 entries. No action needed now.
