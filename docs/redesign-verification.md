# Redesign implementation verification — 5 November 2026

## Scope and provenance

Local branch: polish/landing-unslop, starting commit 9ee23af. The pre-existing changes in globals.css, Header, Icon, NavLinks and navbar-verification.md were preserved. No commit, push, PR, deployment, Figma/GDocs edit, sharing change or database mutation was performed.

Read PRODUCT.md, DESIGN.md, shared tokens, relevant components, and product document Design & Prototype / Progress Report. The document still records V4 and November 3 progress; current code and new 143 Figma frames take precedence. Read design context for Components 143:49362 and all 22 desktop/mobile nodes supplied in the request. Source mapping and visual rules are in [DESIGN.md](../DESIGN.md).

## Implemented

- Cream #f7f4ec page, white task cards, navy hero, pale blue evidence grouping, cream footer, 16px card radius and revised typography through shared tokens.
- National entry retains multi-region navigation, region choice and simulation demo. Jakarta home retains verified six-field chart and coverage count.
- Two-column desktop program grid, one column on phones; explicit neutral stage badges, complete source line and detail affordance. Existing filter/search behavior retained.
- Detail and PPID inherit white surfaces and rounded panels; letter preview keeps actual generated content and copy/download functions.
- Tracker request table presents two desktop cards per row and one mobile card. Storage, import, export and migration logic unchanged.
- Methodology adds sticky section navigation on desktop and stacked links on phones.
- Region dialog resets hero color inheritance to keep readable text on white. Hero keyword chips and placeholders were corrected after inspecting rendered screenshots.
- Existing widening/thinning navbar and mobile menu preserved.

## Verification

Production preview: http://localhost:3114/ and http://localhost:3114/dki-jakarta, API_BASE_URL=https://jejakjanji-api-preview.hapishanipudin.workers.dev.

Typecheck passed. Tests: 44 passed, 3 database integration tests skipped. Production build passed using Node Next.js webpack. Default Bun/Turbopack build failed in its CSS worker (process exited before connection), including outside the restricted environment; webpack completed successfully. Lint passed after formatting generated verification JSON.

Browser matrix: national landing, Jakarta home, program list, Detail 2.11.11, PPID, tracker and methodology at 1440, 1280, 390 and 375px. All 28 checks reported no horizontal overflow. Full-page screenshots were saved and representative desktop/mobile screenshots inspected visually. Automated overflow checks do not prove every glyph or every possible content length.

All 13 basic interaction checks and 8 additional flow checks passed. Automatic playback was tested after pressing Play; existing behavior starts paused.

Browser interactions: header top/floating/reverse with stable content position; mobile hamburger; Escape menu/dialog; region dialog; demo prev/next and radio; reduced-motion play control; PPID clipboard/download; tracker empty state, v1 migration, import and v2 export, persistence after reload; empty search; unknown program. Detailed results: [interaction results](screenshots/redesign/interaction-results.json), [flow results](screenshots/redesign/flow-results.json), [viewport results](screenshots/redesign/browser-results.json).

Uncurated region and API 503 states were exercised through a temporary localhost API/server, with screenshots. Neither fixture was written to production data. Tracker fixtures existed only in a fresh automation browser context, then were cleared. Palette text contrast measurements are in [contrast results](screenshots/redesign/contrast-results.json); this is not a complete WCAG audit.

## Screenshots

Historical before references, from October 29 production captures (not the exact uncommitted navbar baseline): [home](screenshots/data-asli/1-beranda-1280.png), [list](screenshots/data-asli/2-daftar-program-1280.png), [detail](screenshots/data-asli/3-detail-2.11.11-1280.png). See their README for provenance. An attempted fresh baseline was discarded because the old server lost its CSS assets during rebuilding.

After: [home desktop](screenshots/redesign/after-1440-_dki-jakarta.png), [home phone](screenshots/redesign/after-375-_dki-jakarta.png), [list](screenshots/redesign/after-1440-_dki-jakarta_program.png), [PPID phone](screenshots/redesign/after-390-_dki-jakarta_program_2.11.11_ppid.png), [dialog](screenshots/redesign/dialog-mobile.png), [tracker fixture](screenshots/redesign/tracker-fixture-desktop.png), [uncurated fixture](screenshots/redesign/state-uncurated-fixture.png), [error fixture](screenshots/redesign/state-error-fixture.png).

## Adaptations and limits

This is visual-language alignment, not a pixel-identical copy. Real program names, money, source text and legal review notices determine wrapping and page height. No sample Figma budgets, dates, documents, categories or tracker records were imported. The chart retains its verified six fields, source block, percentages and full-value tooltip. Existing icon assets and functional controls remain; Figma iconography, exact source-per-row composition, footer navigation, detailed PPID applicant form, and every component's exact spacing are not reproduced. The PPID remains the existing bracket-fill draft flow; no new personal-data form or backend was added.

No physical-device, Safari, screen-reader, geolocation permission/provider, print, no-JavaScript, low-end animation performance or full keyboard journey audit. Focus/Escape was checked for menu/dialog; every popover and focus order was not exhaustively tested. Text contrast was measured for key palette pairs, not every computed element. Database tests require a database and remain skipped. OpenNext/Cloudflare packaging was not rerun.
