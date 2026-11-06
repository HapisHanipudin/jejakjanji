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

# Second pass: Figma Redesign refinement — 5 November 2026

The adaptations above that say icons, per-row sources, footer navigation and the applicant form are not reproduced are superseded by this pass.

## Scope and provenance

Worked directly in the original repository on branch `feat/redesign-ui-alignment` at `4b7ad3a` (equal to `origin/feat/redesign-ui-alignment`; history order 9ee23af, b0a2e60, 4b7ad3a). The branch was checked out in the earlier project-mirror worktree. That worktree was clean, so it was switched to a detached HEAD at the same commit (no files changed, nothing deleted) to free the branch for this directory. Nothing was committed, pushed, merged or deployed. Figma, Google Docs, sharing, databases and deployment were not modified.

Re-read through Figma MCP: design context for Components 143:49362, and screenshots of Beranda 143:46269/143:46441, Daftar 143:46607, Detail 143:47434, PPID 143:47768, Pelacak 143:48020, Metodologi 143:48318, Gagal memuat 143:48738 and Pelacak kosong 143:49226. Exact values (button 48px with 8px radius, status pill, notice, source line, budget row, region picker, footer) came from the component design context, not thumbnails. The other mobile and state frames were not reopened individually in this pass.

## Changes

- Tokens: button and input radius 8px; `--radius-sm` defined (it was referenced but missing); 2px focus outline with a 3px gap; 24px value size; 12px chart track; 700 weight for the wordmark only. Inputs, select menus and date popovers are white.
- Icons: one Lucide-style 24px-grid set replaces the 16px set. Adds map pin, file text/check, help/check circles, info, search, arrow up-right, folder open, cloud off and hard drive.
- Header: Figma brand mark and wordmark; region pill with map pin beside the brand; navy active link. Navbar motion unchanged.
- Footer: Figma structure with region-scoped quick links (44px targets), contact, divider, neutrality note and pagu label.
- Status pill: icon plus text; unknown stays dashed (product rule). Source line: file icon, 14px.
- Program card rebuilt to JJ/Program card: code, title, field, source, stage rows, divider, 2026 RPJMD pagu with label, Lihat detail. Unused table-header and arrow-overlay CSS removed.
- Budget chart rebuilt to JJ/Budget bar row: stacked rows with field link and arrow, curated-program count always visible (hover reveal removed), value and share, 12px track, per-row RKPD source with its own PDF page.
- Detail: "Jejak bukti" evidence steps with a left rule and stage icons.
- PPID: white form cards. New optional applicant fields (name, address, contact, target agency, purpose, delivery method, place and date) replace their own bracket in the preview. They are never stored or sent; empty fields keep brackets. Unit test added in `surat.test.ts`.
- Tracker: storage notice with export and import moved to the top; empty state uses the shared state panel.
- Shared `StatePanel` for not found, uncurated region, failed region load, root error and empty tracker. Notices are pale blue with an info icon. Region picker follows JJ/Region picker: 80px option cards, current region marked, 44px icon close button.
- DESIGN.md rewritten for this direction with node IDs; `.impeccable/design.json` synchronized.

## Verification

Production server (Node, webpack build): http://localhost:3124 with `API_BASE_URL=https://jejakjanji-api-preview.hapishanipudin.workers.dev`. Fixture server: http://localhost:3125, pointed at a temporary local proxy on port 3199 that either added one fictional uncurated region or returned 503. The proxy only read the preview API. Fixtures lived in a scratch directory, not in the repository or any database.

- `bun run typecheck`: passed. `bun run lint` (eslint and prettier): passed. `bun run test`: 45 passed, 3 database integration tests skipped (no database).
- `next build --webpack` with Node: passed. The default Bun/Turbopack build was not retried.
- Viewports 1440, 1280, 390 and 375 px on 7 routes: 28 of 28 without horizontal overflow ([after](screenshots/redesign-v2/viewport-results.json), [before](screenshots/redesign-v2/before-viewport-results.json)). Full-page screenshots were inspected at 1440 and 390 px for home, list, detail, PPID, tracker, methodology and landing.
- Interactions, 23 of 23 passed in the final run ([results](screenshots/redesign-v2/interaction-results.json)):
  - Header top, floating and reverse. Desktop 1184×90 to 1240×62 and back; mobile 350×82 to 366×62 and back. Main content stayed at 90px and 82px.
  - Active link; hamburger open, Escape returns focus to the toggle, link selection closes it, 48px toggle.
  - Region dialog on desktop and mobile: current region marked, 44px close button, Escape closes.
  - Demo: next and previous; automatic advance after Play; Pause holds the step; radio selection; simulation label present.
  - Reduced motion: header transition 0s; demo does not autoplay.
  - PPID: applicant fields update the preview; clipboard copy; `.txt` download; no request carried applicant text.
  - Tracker: empty state; v1 to v2 migration with region 31 and persistence across reload; v2 export; import with automatic backup download.
  - Empty search; unknown program returns 404; footer links are region-scoped.
- One earlier desktop region-dialog run failed, probably timing during the 180ms entrance. A standalone rerun and the final full run passed.
- Tracker fixtures used fresh automation browser contexts, and storage was cleared afterwards. The normal browser profile was not touched.
- Contrast (computed): navy on pale blue 6.96:1, muted on white 6.95:1, muted on pale blue 5.59:1, body on pale blue 13.22:1, navy on cream 7.88:1, white on navy 8.66:1. Non-text: dashed outline 4.74:1, bar on track 3.16:1.

## Screenshots

Fresh baseline from this branch before editing, and after, at 1440 and 390 px:

- Home: [before](screenshots/redesign-v2/before-1440-_dki-jakarta.png), [after](screenshots/redesign-v2/after-1440-_dki-jakarta.png), [after phone](screenshots/redesign-v2/after-390-_dki-jakarta.png).
- List: [before](screenshots/redesign-v2/before-1440-_dki-jakarta_program.png), [after](screenshots/redesign-v2/after-1440-_dki-jakarta_program.png), [after phone](screenshots/redesign-v2/after-390-_dki-jakarta_program.png).
- Detail 2.11.11: [before](screenshots/redesign-v2/before-1440-_dki-jakarta_program_2.11.11.png), [after](screenshots/redesign-v2/after-1440-_dki-jakarta_program_2.11.11.png).
- PPID: [before](screenshots/redesign-v2/before-1440-_dki-jakarta_program_2.11.11_ppid.png), [after](screenshots/redesign-v2/after-1440-_dki-jakarta_program_2.11.11_ppid.png), [filled](screenshots/redesign-v2/ppid-filled.png).
- Tracker: [before](screenshots/redesign-v2/before-1440-_dki-jakarta_pelacak.png), [after](screenshots/redesign-v2/after-1440-_dki-jakarta_pelacak.png), [fixture](screenshots/redesign-v2/tracker-fixture.png), [empty phone](screenshots/redesign-v2/tracker-empty-390.png).
- Methodology: [after](screenshots/redesign-v2/after-1440-_dki-jakarta_metodologi.png), [after 375](screenshots/redesign-v2/after-375-_dki-jakarta_metodologi.png). Landing: [after](screenshots/redesign-v2/after-1440-_.png).
- Region dialog: [desktop](screenshots/redesign-v2/dialog-desktop.png), [mobile](screenshots/redesign-v2/dialog-mobile.png), [with uncurated fixture](screenshots/redesign-v2/landing-dialog-uncurated-1440.png).
- States: [error](screenshots/redesign-v2/error-1440.png), [uncurated](screenshots/redesign-v2/uncurated-1440.png), [uncurated phone](screenshots/redesign-v2/uncurated-390.png), [not found](screenshots/redesign-v2/not-found-1440.png).

## Remaining Figma differences

- Jakarta hero keeps the verified coverage figure instead of Figma's "Mulai dari dokumen" side card, and keeps example keyword chips.
- Home evidence section keeps the interactive evidence explorer instead of three static cards.
- Budget chart shows the mandatory label once per section, not on every row.
- "Belum diketahui" is dashed, not solid.
- Detail keeps its real indicator figures, per-year pagu bars and source card; Figma's sample indicators and table are not copied.
- PPID keeps the five numbered steps and the legal-review notice. Figma's year field is omitted because the reviewed letter template has no year placeholder.
- Tracker keeps the request cards and themed status select instead of Figma's open option list. The empty state links to the program list instead of a direct "Buat draf PPID".
- Methodology keeps current content and section names; Figma's "Di halaman ini" label and active underline in the side navigation were not added.
- Figma's "Data contoh" banner is not shown because the site uses real data.

## Limits

No physical devices, Safari, Firefox, screen reader, real geolocation permission, print, no-JavaScript or low-end performance testing in this pass. No full WCAG audit; focus and Escape were checked for the menu and dialog only. 1280 and 375 px screenshots were checked for overflow but not all inspected visually. OpenNext/Cloudflare packaging was not run.
