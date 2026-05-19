## Context

The current root route `src/app/page.js` redirects visitors to `/dashboard`, while the existing landing experience lives separately under `src/app/landing/page.js` and components under `src/app/landing/components/`. That landing experience presents 9Router as an AI endpoint proxy, but the content is broad and the visual language is close to a generic dark SaaS template. The README frames a sharper product promise: save 20-40% tokens with RTK, keep coding through rate limits, and route coding tools across subscription, cheap, and free providers.

The change should make `/` the single public marketing landing page for developers evaluating 9Router as a SaaS product while preserving dashboard access through explicit CTA/navigation, GitHub/docs links, and the app shell.

## Goals / Non-Goals

**Goals:**

- Present a creative, product-specific first viewport for 9Router with a clear SaaS value proposition.
- Show how traffic moves from coding tools through 9Router to provider tiers, with visible benefits such as token savings, fallback, and quota usage.
- Improve conversion paths with primary and secondary CTAs that map to starting the app and reading documentation.
- Keep the page responsive, accessible, and maintainable inside the existing Next.js/Tailwind component structure.

**Non-Goals:**

- No billing, checkout, authentication, or dashboard behavior changes.
- No new backend APIs or data model changes.
- No new dependency unless implementation discovers a hard blocker in existing tooling.
- No broad redesign of dashboard pages or authenticated app surfaces.

## Decisions

- Implement as a focused homepage refresh in `src/app/page.js`, reusing or moving existing landing components where useful.
  - Rationale: The product should sell itself at `/`, and the current component split gives implementation a low-risk source for section patterns.
  - Alternative considered: Keep `/landing` as the marketing route. This would preserve an extra destination the user no longer wants.

- Use static, product-grounded content rather than fetching marketing data.
  - Rationale: The claims are known from the README and do not require runtime data, keeping the page fast and simple.
  - Alternative considered: Pull plan or usage data into the page. This would add backend coupling without improving the core marketing experience.

- Build the creative visual story with HTML/CSS/Tailwind and existing icon assets.
  - Rationale: Existing dependencies already support polished visuals, animations, and responsive layouts.
  - Alternative considered: Add a motion or 3D library. This would increase bundle weight for a marketing page and is unnecessary for the requested scope.

- Keep CTAs explicit and task-oriented.
  - Rationale: Visitors should immediately understand how to try 9Router or inspect the docs.
  - Alternative considered: Use vague marketing CTAs. That would weaken conversion for a developer-focused tool.

## Risks / Trade-offs

- Visual ambition could reduce readability on small screens -> verify mobile layout and keep text containers constrained.
- Animation or decorative layers could harm performance -> use CSS-only effects and avoid heavy runtime loops.
- Strong SaaS positioning could overpromise if copy drifts from product reality -> keep claims aligned with README-backed features and avoid unsupported guarantees.
- Replacing too much component structure could make review noisy -> preserve route boundaries and only refactor landing components when needed for clarity.
