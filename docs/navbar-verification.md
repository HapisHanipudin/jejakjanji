# Floating navbar verification

Verified locally on 5 November 2026 using the production build at port 3108.

The header becomes a floating panel after passing the 64 px marker. Its surface moves and gains rounded corners and a shadow without changing the header's layout height. Region and navigation buttons now have hover and pressed states. The region trigger includes a chevron.

## Checks performed

- Typecheck, lint, production build, and diff whitespace checks passed.
- Tests: 44 passed, 3 skipped. Database integration tests were not configured.
- Desktop at 1280 px: floating state appeared during scrolling and cleared at the top. The main content's document position stayed at 75 px.
- Mobile at 375 px: all four navigation links fit without horizontal overflow. The region trigger measured 46 px high.
- The region dialog opened from the floating header. Keyboard activation and Escape dismissal worked on mobile.
- A direct link to the landing demo left the section heading below the floating header.
- Desktop and mobile screenshots were inspected visually.

## Limits

Reduced-motion handling was checked in the stylesheet, not emulated during this navbar browser pass. Physical devices, Safari, screen readers, and low-end hardware performance were not tested. These changes have not been committed, pushed, or deployed.

## Follow-up: smoother transition and mobile menu

The preceding implementation was committed as `9ee23af`. This follow-up remains uncommitted.

- Unified the floating surface transitions to 420 ms with the same deceleration curve, including reverse transitions.
- Mobile navigation now uses a 44 px hamburger button. The panel contains the existing region picker and navigation links.
- Opening and closing, Escape from a link or toggle, and closing on link activation were checked in the browser. Desktop navigation remains visible.
- Production preview at port 3112 was inspected at 390 px and 1280 px. Neither viewport had horizontal overflow. Scrolling enabled the floating state; returning to the top cleared it.
- Added a CSS fallback that exposes navigation when scripting is disabled. This fallback and reduced motion were reviewed in source, not exercised in this browser pass.
- Typecheck, lint, production build, and whitespace checks passed. Tests passed: 44, with 3 database integration tests skipped.
- Physical mobile devices, Safari, screen readers, and animation performance on low-end hardware remain untested. No push or deployment was performed.

### Correction: animate width and thickness

The requested movement is a shape change rather than a fade. The header now reserves a fixed layout space while its panel widens and becomes thinner over 420 ms. Background fading was removed.

Browser measurements at the 1280 px viewport showed panel width increasing by about 64 px and height changing from 90 px to 62 px. The main content remained at document position 90 px. At 390 px, height changed from 82 px to 62 px; the hamburger still opened and closed, with no horizontal overflow. Returning to the top restored the taller panel. Preview: port 3113.

Width and internal minimum height intentionally animate to reflow the contents without scaling text or controls. Performance on physical devices remains unmeasured. Build and lint passed; this CSS-only correction did not rerun the previously passing test suite.
