# Landing polish — 5 November 2026

Scope approved by the user: light polish of the landing, preserving the brand,
features, data, section order, and automatic demonstration. Branch:
`polish/landing-unslop`, based on main after PR #8 merged.

## Direction

- Product: help citizens check regional priority programs through official sources.
- Character: careful, calm, transparent.
- World: a fact-checker's working sheet, cream paper and navy ink.
- Moments: the automatic demonstration and the evidence trail; quiet surrounding UI.
- Signature: the source document, PDF page, and check date stay beside the content.

## Audit and passes

1. Spacing: landing actions now form one group with 12 px gaps. Mobile hero and
   demonstration sections use 48 px vertical padding, the hero columns a 32 px
   gap, and mobile example padding is 16 px. Coverage padding is 24 px. Changes
   are scoped to `.landing-page`.
2. Color: retained the established navy/cream tokens. No new accent, gradients,
   imagery, glows, or status colors.
3. Icons: retained the existing set; no new icons or decorations were needed.
4. Copy: shortened the hero introduction without adding claims. Moved the
   simulation/data-scope explanation to the demo header and removed repeated
   per-step text and the duplicate counter. Removed periods from two headings.
5. Type: kept Plus Jakarta Sans and the established heading hierarchy. Demo
   explanation headings use 22 px/600 on desktop and 20 px on mobile. The brand's
   chosen display weight was retained rather than replaced by a generic scale.
6. Layout: one primary Jakarta action plus one secondary region-picker action in
   the hero. Location remains inside the existing dialog with its consent step.
   The remembered-region shortcut moved into the dialog. Each coverage-region
   name remains a real link, replacing the repeated primary CTA.
7. Details: removed the inner example border, retained its paper surface and
   document rule, and reduced demo control padding. Focus styles and touch
   targets remain intact.
8. Visuals: kept the actual product demonstration and real API-backed examples.
   No generated visual, prompt, fabricated data, or new asset was needed.
9. Motion: preserved the requested automatic control choreography and its pause
   behavior. Existing panel-height interpolation remains an explicit exception
   to Unslop's transform-only preference to preserve the previously approved
   smoothing. Low-end-device performance has not been profiled.

## Verification

- Production build, typecheck, lint, and 44 tests passed. Three PostgreSQL
  integration tests skipped because the test database was not configured.
- Local production server at port 3108 uses the existing preview API.
- Browser: dedicated headless Chrome profile, desktop 1280 px, mobile 390/375 px.
  Desktop and mobile screenshots inspected; no clipping or overflow observed.
- Hero: exactly one primary and one secondary visible action, including with a
  remembered region. Jakarta and coverage links target the real regional page.
- Dialog: remembered-region shortcut present; location consent displayed, with
  no BigDataCloud request made. GPS was not requested.
- Demo: automatic options highlight and program selection, pause, unknown
  evidence status, radio changes, and matching program/stage PPID URLs passed.
- Reduced-motion browser emulation: playback hidden, manual steps/radios work,
  and no running animations. Without JavaScript the Jakarta link and five static
  step labels remain available.
- No uncaught browser errors. The test-only Chrome process was closed afterward.

No commit, push, PR, deployment, database migration, Figma edit, or GDocs edit.
Physical devices, Safari, screen readers, and slow-network performance were not
tested. This is not user research or a claim of full WCAG conformance.

Method adapted from Unslop by Damir Sokolovsky
([@heydamir](https://x.com/heydamir)), licensed CC BY 4.0.

## Follow-up: icon controls

At the user's request, the demo's previous/next and play/pause controls now show
SVG icons from the existing icon set. Buttons retain Indonesian `aria-label`
and `title` values, disabled states, and 48 × 48 px targets. Replay uses the play
icon with the accessible name “Putar ulang”. Playback behavior is unchanged.
