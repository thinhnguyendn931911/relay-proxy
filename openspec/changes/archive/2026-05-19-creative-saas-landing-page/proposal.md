## Why

9Router already has a functional landing page, but it reads like a generic AI proxy overview instead of a compelling SaaS product page. A more creative, conversion-focused page can better communicate the product's core promise: keep coding through provider limits while saving tokens and cost.

## What Changes

- Rework the root `/` experience around a distinctive first viewport, stronger product messaging, and clear CTAs for starting or reading docs.
- Add product-specific sections that explain token savings, fallback routing, provider coverage, CLI compatibility, and SaaS value.
- Improve visual storytelling with a richer interactive/product-like composition while keeping the page responsive and accessible.
- Align copy with 9Router's current README positioning: RTK token savings, subscription maximization, auto fallback, multi-account routing, and universal CLI compatibility.
- Replace the current root redirect-to-dashboard behavior with the marketing landing page while keeping dashboard access available through CTA/navigation.

## Capabilities

### New Capabilities

- `landing-page-conversion`: Requirements for the creative SaaS landing page, including messaging, sections, CTAs, responsiveness, and visual/product storytelling.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/app/page.js` and reusable landing components under `src/app/landing/components/`.
- User-facing impact: improved landing-page clarity, visual appeal, and conversion flow for prospective SaaS users.
- APIs: none expected.
- Dependencies: no new dependency expected; use existing Next.js, React, Tailwind, and available icon/font assets unless implementation shows a strong need.
