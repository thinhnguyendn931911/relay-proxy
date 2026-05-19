## 1. 404 Page

- [x] 1.1 Create `src/app/not-found.js` with a styled "Page Not Found" message and a link back to the homepage
- [x] 1.2 Verify the 404 page renders for unmatched UI routes and that API 404s still return JSON

## 2. 403 Page

- [x] 2.1 Create `src/app/forbidden/page.js` with a styled "Access Denied" message and navigation link
- [x] 2.2 Update `src/dashboardGuard.js` to redirect non-API 403 responses to `/forbidden` instead of returning JSON
- [x] 2.3 Verify the 403 redirect works for local-only paths and that API 403s still return JSON

## 3. Styling

- [x] 3.1 Style both error pages to match the application's existing layout and visual conventions
