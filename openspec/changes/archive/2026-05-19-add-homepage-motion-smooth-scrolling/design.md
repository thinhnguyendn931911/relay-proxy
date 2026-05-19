## Context

The root homepage is implemented in `src/app/page.js` as a client component with section anchors for endpoint, plans, and features. Global styles live in `src/app/globals.css`, and the app currently has no animation dependency such as Framer Motion.

The homepage already meets the core conversion requirements: product positioning, authentication-aware header actions, endpoint display, plan promotion, and responsive presentation. This change should make that page feel more polished without changing the product message or routing behavior.

## Goals / Non-Goals

**Goals:**

- Add subtle motion to the homepage hero, section content, repeated cards, and calls to action.
- Make homepage anchor links scroll smoothly to their target sections.
- Respect `prefers-reduced-motion` for users who opt out of motion.
- Keep the implementation small and local to homepage presentation.

**Non-Goals:**

- Rebuild the homepage content, layout, or conversion funnel.
- Add scroll-jacking, pinned scenes, route transitions, or complex timeline animation.
- Add a third-party animation dependency unless implementation proves CSS/React primitives are insufficient.
- Change dashboard, app, API, authentication, or billing behavior.

## Decisions

1. Use CSS-first motion for static entrance and interaction effects.
   - Rationale: The requested behavior is presentational and limited to one page, so CSS keyframes, transitions, and Tailwind utility classes are enough.
   - Alternative considered: Add an animation library. Rejected because it increases dependency and client bundle weight for a narrow effect set.

2. Use lightweight React state only if scroll-reveal needs viewport detection.
   - Rationale: Initial hero animation can run on mount with CSS alone. Scroll-reveal for below-fold sections may use `IntersectionObserver` through a small local helper if CSS-only timing is not enough.
   - Alternative considered: Animate all below-fold content immediately. Rejected because it can finish before users reach those sections.

3. Implement smooth scrolling through standards-based behavior.
   - Rationale: CSS `scroll-behavior: smooth` and `scroll-margin-top` support anchor navigation while preserving native browser semantics.
   - Alternative considered: Imperative `scrollIntoView` handlers on every link. Rejected unless required, because normal anchors are simpler and more accessible.

4. Prefer reduced-motion fallbacks over removing content transitions entirely.
   - Rationale: Users with reduced motion should get immediate content without opacity delays or movement.
   - Alternative considered: Keep opacity fades only. Rejected because delayed fades can still create a less stable reading experience.

## Risks / Trade-offs

- Motion causes layout shift or delayed readability → Animate transform and opacity only, keep final layout dimensions stable, and avoid animating height, width, or position that affects document flow.
- Fixed header covers anchor targets → Add section scroll margins that account for the fixed header.
- Reduced-motion users still see movement → Add explicit `prefers-reduced-motion: reduce` overrides for animations, transitions, and smooth scrolling.
- Homepage becomes visually busy → Limit motion to one entrance pass, small reveal offsets, and hover/focus polish.

## Migration Plan

No data migration is needed. Ship as a frontend-only homepage presentation change. Rollback is removing the homepage motion classes/helper and smooth-scroll global styles.

## Open Questions

None.
