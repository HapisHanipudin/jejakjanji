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
