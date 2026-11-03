# Landing flow demo — 4 November 2026

## Scope

Reviewed the existing public preview and local production landing against PRODUCT.md
and DESIGN.md using Impeccable's animation guidance. The general landing and
Jakarta-first coverage remain. Replaced the three static explanation cards with
one five-step demonstration: program, source, evidence, PPID draft, tracker.

The demonstration contains process labels, not fabricated program data. It is
explicitly labeled a simulation. It never sends requests or writes tracker data.
Users start playback themselves, pause it, or select any step. A step lasts five
seconds; playback ends after the last step. Leaving the viewport, hiding the
document, or changing the motion preference pauses playback. Reduced-motion CSS
removes the reveal and hides playback; manual step buttons remain available.
Without JavaScript, the ordered step names and initial explanation remain visible.
No new dependencies, backend changes, or database changes.

## Verification

- `bun run typecheck`: passed.
- `bun run lint`: passed after the final UI changes.
- `bun run test`: 42 passed, 3 PostgreSQL integration tests skipped because the
  test database was not configured. Existing tests do not cover the new component.
- `bun run --cwd apps/web build`: passed after the final UI changes.
- Browser: local `next start`, API_BASE_URL points to the existing preview API.
  Desktop 1280 px and mobile 390 px screenshots inspected. No dev badge, text
  clipping, or horizontal overflow observed. Also checked overflow at 375 px.
- Browser assertions: PPID panel says the user sends the request themselves;
  duplicate explanation cards removed; no mobile horizontal overflow; playback
  pauses when the demo leaves the viewport. Mobile controls measured 47–48 px tall.
- Manual controls: source, evidence, PPID, tracker, replay from the end, pause,
  and keyboard Enter tested. Automatic progression to the tracker observed.

## Limits

Reduced-motion behavior was checked in source, not by changing the browser's
motion preference. Hidden-tab pause was not exercised. No screen-reader audit,
Safari/iOS test, real-device test, or formal user study. The demo is a schematic
explanation rather than an interactive reproduction of the application screens.
The Impeccable hook reported no deterministic issues in edited UI files, but its
design-system sidecar is older than DESIGN.md; it was not regenerated in this task.
Implementation was verified locally before preparing the PR at the user's request.
No deployment, Figma edit, or GDocs edit in this session.
