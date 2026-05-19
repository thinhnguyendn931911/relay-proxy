## 1. Landing Structure

- [x] 1.1 Audit existing `/landing` components and identify which sections can be reused, moved, or replaced for the root homepage.
- [x] 1.2 Update `src/app/page.js` so `/` renders the refreshed landing page instead of redirecting to `/dashboard`.
- [x] 1.3 Remove or redirect the old `/landing` route so `/` is the canonical marketing page.

## 2. Hero and Conversion

- [x] 2.1 Rework the hero copy to position 9Router as a SaaS product for token savings, fallback routing, and provider-limit resilience.
- [x] 2.2 Add primary and secondary CTAs that navigate to the existing dashboard/start flow and documentation/GitHub flow.
- [x] 2.3 Ensure the first viewport includes the product name, core benefit, and at least one concrete savings or reliability claim.

## 3. Product Story

- [x] 3.1 Add or update sections covering RTK token savings, subscription quota maximization, provider fallback, multi-account routing, and CLI compatibility.
- [x] 3.2 Include compatibility references for Claude Code, Codex, Cursor, Cline, and OpenCode.
- [x] 3.3 Align all landing-page claims with current README-backed product capabilities.

## 4. Visual Experience

- [x] 4.1 Build a creative routing visualization showing coding tools flowing through 9Router to provider tiers or fallback destinations.
- [x] 4.2 Use existing React, Tailwind, and icon assets without adding dependencies unless a blocker appears.
- [x] 4.3 Keep decorative effects lightweight and CSS-based.

## 5. Verification

- [x] 5.1 Run lint or the nearest available static check for the touched frontend code.
- [x] 5.2 Run a production build or nearest feasible Next.js verification command.
- [x] 5.3 Verify `/` at desktop and mobile viewport sizes for readability, tappable CTAs, and no incoherent overlap.
