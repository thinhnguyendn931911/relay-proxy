## Why

The homepage currently communicates the product clearly, but it feels static and simple. Adding tasteful motion and smooth in-page scrolling will make the public experience feel more polished while keeping the core conversion path easy to scan.

## What Changes

- Add homepage entrance and scroll-reveal motion for primary sections, cards, and calls to action.
- Add smooth in-page scrolling for homepage anchor links in the header and footer.
- Preserve direct links, authentication actions, and CTA navigation behavior.
- Respect reduced-motion preferences so users who opt out of motion receive a stable experience.
- Avoid scroll-jacking, layout shifts, or animation that blocks reading or interaction.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing-page-conversion`: Homepage presentation gains smooth scrolling and motion requirements while preserving the existing conversion content and responsive accessibility requirements.

## Impact

- Affected code: `src/app/page.js` and possibly `src/app/globals.css`.
- Affected behavior: public homepage anchor navigation, section/card presentation, and reduced-motion handling.
- APIs: none.
- Dependencies: none expected; prefer CSS and React primitives already available in the Next.js app.
