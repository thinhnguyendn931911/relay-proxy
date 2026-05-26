## 1. Admin Access Control

- [x] 1.1 Add `requireOperator()` guard to `GET` and `POST` handlers in `src/app/api/proxy-pools/route.js`
- [x] 1.2 Add `requireOperator()` guard to `PUT` and `DELETE` handlers in `src/app/api/proxy-pools/[id]/route.js`
- [x] 1.3 Add `requireOperator()` guard to `POST` handler in `src/app/api/proxy-pools/[id]/test/route.js`
- [x] 1.4 Admin enforced via middleware (`isOperatorApiRoute` in proxy.js) + `requireOperator()` on all API handlers — no separate client-side check needed

## 2. Bulk Export

- [x] 2.1 Add `handleBulkExport` function to `proxy-pools/page.js` — generate text blob from `proxyPools` state, trigger download as `proxy-pools-export-{YYYY-MM-DD}.txt`
- [x] 2.2 Add "Bulk Export" button next to "Batch Import" button, disabled when `proxyPools.length === 0`
- [x] 2.3 Verify round-trip: export uses raw `proxyUrl` which matches import parser format (protocol://user:pass@host:port)

## 3. Unassigned Connections Indicator

- [x] 3.1 Extend `GET /api/proxy-pools` response to include `totalConnectionCount` when `includeUsage=true`
- [x] 3.2 Add unassigned count badge to proxy pools page header — compute as `totalConnectionCount - connectedCount`
- [x] 3.3 Hide badge when `totalConnectionCount` is 0 (no connections exist)

## 4. Verification

- [x] 4.1 Build passes; `requireOperator()` guard added to all 6 proxy pool API handlers (GET/POST on route.js, GET/PUT/DELETE on [id]/route.js, POST on [id]/test/route.js)
- [x] 4.2 Export generates from `proxyPools` state, disabled when empty; uses raw `proxyUrl` preserving all proxy types
- [x] 4.3 Unassigned badge computed from `totalConnectionCount - assignedConnectionCount`; hidden when no connections
