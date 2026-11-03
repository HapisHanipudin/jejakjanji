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

## Follow-up: interactive examples — 4 November 2026

Branch: `feat/landing-interactive-demo`, based on main after PR #7 merged.
Changes remain uncommitted while the interactive version is reviewed.

- Reuse the landing's region program lists and fetch at most two Jakarta program
  details through the existing validated API client. Prefer 2.11.11 when it is
  present in that list; choose the other example from the actual list. No invented
  program, region, status, target, or source data. Detail requests run in parallel.
- Reuse ThemedSelect, SourceBox, StatusBadge, and the existing PPID information
  mapping. The selected program persists across steps. The source step expands
  the real indicator and target and links to the original PDF page and check date.
- Evidence buttons display the selected program's actual stage status. They link
  to that program's own detail, never another program's detail.
- Choosing budget or implementation information changes the request excerpt and
  the real PPID link's `minta` parameter. The excerpt is not a completed legal
  letter. Tracker information expands on demand; opening the tracker is a real
  navigation, not a simulated save.
- Add previous/next controls. Interacting with or focusing the example pauses
  playback. The demo does not write tracker records or send applications.
- If examples cannot be fetched, retain the schematic explanation. Without
  JavaScript the program selector is disabled; the initial program and source
  stay readable, without implying selection changes the page.

Validation after the final CSS fix: production build, typecheck, lint, and 42
existing tests passed; three database integration tests skipped. Browser
assertions exercised program selection and persistence, source disclosure,
unknown evidence status, both request choices, matching preview and PPID URL,
keyboard activation, previous/next boundaries, and selection retention on return.
Following the real PPID link selected the matching program and the expected
implementation checkboxes. Screenshots inspected at desktop 1280 and mobile 390;
375 px checked for overflow. Radio targets measured at least 44 px tall and inputs
20 px wide on mobile. An inherited floated legend initially collapsed one radio;
the demo now overrides that float and the radio check passes.

Limits: browser tests used the local production server and preview API. The new
interactions have no dedicated unit tests; browser assertions cover this pass.
The earlier reduced-motion, hidden-tab, physical-device, screen-reader, and Safari
limits still apply. The landing now makes up to two additional detail requests;
their latency has not been profiled on a slow mobile connection. No deployment,
PR, database migration, Figma edit, or GDocs edit for this follow-up.

## Motion and layout refinement — 4 November 2026

- Step scenes enter in 320 ms with a small horizontal movement and opacity
  transition. Evidence results, request excerpts, and changed source lines update
  in 220 ms without remounting the controls or delaying the action.
- A ResizeObserver measures the scene, and a bounded Web Animations height
  transition adjusts its panel in 320 ms. Interrupted transitions start from the
  currently displayed height. Expanded disclosures and viewport changes use the
  same path. Content remains naturally sized when animation ends.
- Reduced motion skips the scripted transitions. Height animation also cancels
  when the preference changes. Existing CSS removes decorative transitions.
- Desktop columns align at the top with more space for the interactive example.
  Mobile steps use a compact three-column grid, explanation comes before the
  example, and step buttons stretch to the same row height. Request excerpts use
  ordinary list markers rather than the schematic row animation.

Verification: production build, typecheck, lint, and 42 existing tests passed;
three database integration tests skipped. Browser checks on the production build
confirmed the 320 ms scene animation, three-column mobile layout at 390 px, no
horizontal overflow on mobile or desktop, successful radio changes and rapid
step changes, and no error/warning logs. After expanding source details, panel
height matched scene height plus padding, with no content clipped at rest.
Desktop and mobile screenshots inspected. These are technical checks, not a
frame-rate measurement on physical hardware. Reduced-motion preference switching
has not been exercised in the browser. No commit, push, PR, or deployment.

## Automatic interaction choreography — 4 November 2026

Playback now performs a bounded sequence inside each scene, instead of only
changing the step. The program scene shows an illustrative options list, highlights
the second real example, and updates the controlled selector. The list is hidden
from assistive technology and does not open or focus a native browser popup.
Source and tracker disclosures open automatically. Evidence stages change from
budget to implementation; PPID radio choices change in the same order and update
the real request excerpt. No pointer is drawn, focus is not moved, and real links
are never clicked by playback. Each scene lasts 6.2 seconds, then advances or ends.

Playback remains opt-in. Pause, user focus/click in the example, leaving the
viewport, hiding the document, or changing the motion preference cancels pending
actions. Manual interaction keeps the currently demonstrated state. Reduced
motion blocks playback even if its handler is invoked.

Layout: label above the full-width program selector; its native and themed
controls retain their shared grid cell rather than occupying separate rows.
Mobile steps use two columns, with the fifth step spanning the final row.

Verification: 44 tests passed, including two fake-timer tests for ordered actions,
pause cancellation, radio sequencing, and finish without looping. Three database
tests skipped. Typecheck, lint, and production build passed. Browser checks
observed the illustrated options and highlight, automatic program change, opened
tracker disclosure, both automatic radio choices, and manual radio takeover that
paused playback. Desktop label positioning and mobile full-row last step/no
overflow checked; screenshots inspected. Reduced-motion switching, physical
devices, screen readers, and slow-connection performance remain untested.
Implementation and verification completed locally before the user authorized
commit, push, PR creation, and merge. No manual deployment or external-document
changes in this pass.
