---
name: JejakJanji
description: Lembar kerja pemeriksa program daerah: tinta arsip di atas kertas krem, setiap angka dengan rujukannya.
colors:
  accent: '#1f4e79'
  accent-text: '#ffffff'
  accent-soft: '#dce8f3'
  link: '#2b5982'
  bar: '#5b84ab'
  bg: '#f7f4ec'
  band: '#f7f4ec'
  surface: '#ffffff'
  surface-strong: '#f2efe7'
  heading: '#17202a'
  text: '#17202a'
  text-muted: '#4f5b66'
  border: '#d5cfc0'
  border-strong: '#6b7480'
  placeholder-bg: '#fff2a8'
  footer: '#f7f4ec'
  footer-text: '#17202a'
  footer-muted: '#4f5b66'
typography:
  figure:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '4.5rem'
    fontWeight: 800
    lineHeight: 1.1
  display:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '3.5rem'
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 800
    lineHeight: 1.22
  landing-title:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '3rem'
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.75rem'
    fontWeight: 600
    lineHeight: 1.2
  value:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.4
  wordmark:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.2
  subhead:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.3
  lead:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.45
  source:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: '6px'
  md: '8px'
  lg: '16px'
  pill: '999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '24px'
  '6': '32px'
  '7': '48px'
  '8': '64px'
  '9': '80px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-text}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '11px 24px'
    height: '48px'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.accent}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '11px 24px'
    height: '48px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    padding: '24px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.heading}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '11px 12px'
    height: '48px'
  status-ada:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.accent}'
    typography: '{typography.source}'
    rounded: '{rounded.pill}'
    padding: '6px 12px'
    height: '36px'
  status-belum-diketahui:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    typography: '{typography.source}'
    rounded: '{rounded.pill}'
    padding: '6px 12px'
    height: '36px'
  notice:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.text}'
    typography: '{typography.source}'
    rounded: '{rounded.lg}'
    padding: '16px'
  region-option:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.heading}'
    rounded: '{rounded.lg}'
    padding: '16px'
    height: '80px'
  chip-filter:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.link}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '6px 12px 6px 14px'
    height: '36px'
  pagu-label:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.heading}'
    typography: '{typography.caption}'
    rounded: '{rounded.md}'
    padding: '6px 14px'
---

# Design System: JejakJanji Redesign

## Authority

Visual source: [Figma Redesign](https://www.figma.com/design/Lq7xYDmjODYgZpJ7jE6F3Z?node-id=135-1285), file `Lq7xYDmjODYgZpJ7jE6F3Z`. Use the 143 nodes, never the 135 V4 copies. Components: 143:49362 (JJ/Nav 143:51510/51553, JJ/Footer 143:51680/51791, JJ/Button 143:51059/51060/51067, JJ/Status 143:51092/51181, JJ/Source line 143:51490, JJ/Program card 143:51902, JJ/Evidence step 143:51903, JJ/Budget bar row 143:51904, JJ/Region picker 143:51905/51935, JJ/Notice banner 143:51499). Desktop/mobile pairs: Beranda 143:46269/143:46441; Daftar 143:46607/143:47023; Detail 143:47434/143:47601; PPID 143:47768/143:47894; Pelacak 143:48020/143:48169; Metodologi 143:48318/143:48425; not found 143:48532/143:48586; uncurated 143:48640/143:48689; error 143:48738/143:48787; region dialog 143:48836/143:49034; empty tracker 143:49226/143:49294. Tokens live only in `apps/web/src/app/tokens.css`.

## Direction

A civic reading desk: cream page, white working surfaces, navy actions and a navy home hero. Pale blue groups evidence stages and carries notices. The footer continues the cream page with quick links and a hairline divider. ENERGY 2 / RHYTHM 3 / MOTION 2. Landing is Persuade; program, PPID and tracker are Operate; methodology is Read.

## Color

Background #f7f4ec, surfaces #ffffff, shadows and the dialog backdrop from one navy-black (`--shadow-ink`, rgb 19 38 59), text #17202a, muted #4f5b66, navy #1f4e79, pale blue #dce8f3, borders #d5cfc0 (hairline) and #6b7480 (inputs, unknown status outline), chart #5b84ab on a #dce8f3 track. Hero text #f4f1e8 and secondary #b9c8d8. Inputs, menus, dialogs and cards are white; notices are pale blue. Measured pairs: navy on pale blue 6.96:1, muted on white 6.95:1, muted on pale blue 5.59:1, white on navy 8.66:1, navy on cream 7.88:1; non-text: unknown outline 4.74:1, bar on track 3.16:1.

## Typography

Plus Jakarta Sans, weights 400/600/700/800 (700 only for the wordmark). Body 16px/1.6. Source lines 14px muted. Card titles and region-picker title 28px semibold, line height 1.2 (24px on phones). Section titles 36px extrabold. Page titles and state titles 56px extrabold, line height 1.15 (32px on phones). Figures in cards 24px semibold, tabular numbers. A 20px step (`--text-md`) serves the phone wordmark and the demo headings on phones; the landing title is fluid from 36px to 48px. Running text keeps a 36em measure (about 75 characters) (lead, card paragraphs, notices), paragraphs use `text-wrap: pretty`, and headings use `balance`. Font sizes are rem so text scales with the reader's setting; long words break instead of widening the page.

## Spacing and layout

4/8/12/16/24/32/48/64/80px scale. Maximum content width 1200px, fluid gutters. Cards pad 24px with 24px internal rhythm. Two program cards per row on desktop, one on phones. Detail keeps content plus a 420px evidence column; PPID keeps a 400px form column plus the letter. Collapse task columns at 1024px; phone treatment at 760px; region dialog becomes a bottom sheet at 640px. Real text determines height.

## Components

- Icons: one Lucide-style stroke set on a 24px grid (`Icon.tsx`): map pin, file text, file check, circle help/check, info, search, arrow right/up-right, chevrons, folder open, cloud off, hard drive. Decorative; text always carries meaning.
- Header: navy 32px "J" mark plus 24px bold wordmark; region pill (map pin, name, chevron, warm hairline, pill radius) sits beside the brand; navigation on the right with a 2px navy underline and navy text for the active link.
- Footer: wordmark, region-scoped quick links (44px targets, navy), correction contact, divider, neutrality note plus the indicative-budget label.
- Touch targets: 44px. Short text links (wordmark, text actions, money values, region links) keep their look and get an invisible 44px-tall hit area, shortened only where it would overlap a neighbouring target.
- Buttons: 48px tall, 8px radius, 16px semibold. Primary navy/white; secondary white with 1px navy border; text action navy with arrow. On the navy hero the primary inverts to white/navy.
- Inputs: white, 1px #6b7480 border, 8px radius, 48px tall, explicit label above.
- Status pill: icon plus text, 36px tall. Ada: pale blue, solid navy border, file-check icon. Belum diketahui: white, dashed #6b7480 border, help icon.
- Source line: file icon plus 14px muted text: document, version, PDF page, check date, link.
- Program card: code, title, field, source line, three stage rows (label left, pill right), divider, 2026 RPJMD pagu with full value in tooltip and the mandatory label, "Lihat detail". The whole card is the link.
- Budget chart: stacked rows (field link plus arrow-up-right, curated-program count, value plus share, 12px track, PDF page with a link), separated by hairlines inside one white card. When all rows share one RKPD document, its full source line (document, version, pages, check date) sits once at the top of the card.
- Detail pagu: a real table (year header cell, 22px track, value, total in `tfoot`) so screen readers get row and column headers; one shared source line below it.
- Tracker records: one white card per request (code line, title, definition list of agency, sent date and deadline, then status select and delete).
- Evidence step: 2px left rule, stage title, pill (its icon is the only icon in the step), search notes, source line.
- Notice: pale blue, 16px radius and padding, optional info icon.
- Landing demo: one white frame (header, steps, stage, controls); inside it a small app window with a navy title bar, cream body like the real pages, white controls, 8px radius and the header's soft shadow, so the simulated screen stands apart from the explanation.
- State panel: white card, 36px navy icon, page-sized title, body, primary action plus text action, optional note. Used for not found, uncurated region, failed load, root error and empty tracker.
- Region picker: white dialog/bottom sheet, 28px title, 44px icon close button, search, 80px option cards; current region pale blue with check icon, available regions map pin, uncurated regions help icon with "Belum dikurasi".

## States

"Belum diketahui" describes evidence availability; "Belum dikurasi" describes regional data coverage. Neither implies failure, and neither uses warning colour. Empty and error states keep recovery actions and honest messages.

## Motion

Header shape transition: 420ms cubic-bezier(0.22,1,0.36,1), widening about 64px and thinning in both directions with fixed layout space. Desktop 90 to 62px; phone 82 to 62px. Mobile menu closes by button, Escape or navigation. The landing demo plays automatically after Play, pauses, and keeps manual steps, radio choices and icon previous/next. Reduced motion removes animation and transitions. Focus: 2px navy outline with a 3px gap.

## Adaptations

- Figma sample money, dates, documents, categories, regions and tracker records are excluded. API and verified sources own all facts.
- National landing keeps the multi-region entry and the simulation label; Figma has no national frame, so it reuses the hero, card and button language.
- "Belum diketahui" keeps a dashed outline (product rule) where Figma draws a solid one.
- Budget chart keeps the mandatory label once in the section header rather than repeating it on every row; each row instead carries its own RKPD page. Figma's stage icon in the evidence step is dropped because the pill already carries the same icon.
- PPID applicant fields fill bracket placeholders in the preview only. They are not stored and not sent. Figma's "Tahun informasi" field is omitted because the reviewed letter template has no year placeholder.
- Program list status filter uses radio chips (48px, pill) on their own row beside the submit button, where Figma draws a select: every option stays visible, one click, still a plain GET field. The PPID call to action sits in its own card under the evidence panel.
- Tracker storage notice holds export/import; the empty state links to the program list because a PPID draft needs a chosen program.
- Hamburger menu, header shape animation, evidence explorer, chart, tracker v2 import/export/migration remain. No scores, accounts, dark mode, splash screen or backend additions.
