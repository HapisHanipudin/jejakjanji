---
name: JejakJanji
description: Lembar kerja pemeriksa program daerah — tinta arsip di atas kertas krem, setiap angka dengan rujukannya.
colors:
  accent: '#1f4e79'
  accent-text: '#ffffff'
  accent-soft: '#dce8f3'
  link: '#2b5982'
  bar: '#5b84ab'
  bg: '#fcfbf7'
  band: '#f6f8fa'
  surface: '#f4f3ee'
  surface-strong: '#f2efe7'
  heading: '#13263b'
  text: '#17202a'
  text-muted: '#4f5b66'
  border: '#d5cfc0'
  border-strong: '#6b7480'
  placeholder-bg: '#fff2a8'
  footer: '#13263b'
  footer-text: '#f4f1e8'
  footer-muted: '#b9c8d8'
typography:
  figure:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '4.5rem'
    fontWeight: 800
    lineHeight: 1.1
  display:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '3rem'
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 800
    lineHeight: 1.22
  title:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.625rem'
    fontWeight: 600
    lineHeight: 1.3
  title-sm:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.45
  lead:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.45
  caption:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: '6px'
  md: '8px'
  lg: '12px'
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
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '13px 22px'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.link}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '13px 22px'
  card:
    backgroundColor: '{colors.bg}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    padding: '28px'
  input:
    backgroundColor: '{colors.bg}'
    textColor: '{colors.heading}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '11px 14px'
    height: '48px'
  status-ada:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.link}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: '4px 12px'
  status-belum-diketahui:
    backgroundColor: 'transparent'
    textColor: '{colors.text-muted}'
    typography: '{typography.caption}'
    rounded: '{rounded.pill}'
    padding: '4px 12px'
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
  date-day-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-text}'
    rounded: '{rounded.sm}'
    height: '36px'
---

# Design System: JejakJanji

## Overview

**Creative North Star: "Lembar Kerja Jurnalis"**

JejakJanji looks like a fact-checker's working sheet: archive ink on cream paper, every figure sitting next to its source page and check date. The mood is careful, neutral, and verifiable. Nothing is dramatised; nothing is decorated to persuade. The interface earns trust by showing its working, not by styling confidence.

Density is that of a working document: generous section spacing between tasks, but tight, scannable rows inside them (program lists, budget bars, source tables). Navy ink carries action and evidence; cream paper and pale bands carry structure. Colour never carries judgement: there is no red, no green, no score. Status is written in words, and "Belum diketahui" is drawn with a dashed outline that is as visible as a solid one.

Components are precise and calm: hairline borders, slightly rounded corners, no ornament. Motion explains rather than entertains. The one authored moment is the Jejak explorer on a region home: picking a stage moves the ink along a single trail and redraws every curated program's dot for that stage. Around it, motion is feedback: the evidence trail draws in order, a chart grows once when it first comes into view, a chart row reveals how many programs sit behind it, a just-added line flashes, a copy confirms. Everything starts already readable and everything stops under reduced motion.

**Key Characteristics:**

- Cream paper (`bg`) with archive-ink navy (`accent`) as the single accent; dark navy footer as the closing band.
- Plus Jakarta Sans throughout, three weights only (400, 600, 800).
- Flat surfaces separated by 1px warm borders and tonal bands; shadows only on floating popovers.
- Source, PDF page, and check date always adjacent to the number they support.
- Status by word and line style (solid vs dashed), never by colour alone.
- One easing curve for all motion; nothing animates without explaining a change.

## Colors

A restrained ink-and-paper palette: one navy accent family on warm cream, with cool and warm neutrals for structure.

### Primary

- **Tinta Arsip** (accent): primary buttons, active navigation underline, filled evidence dots, selected calendar day, checked checkbox, focus rings. The one colour that means "act here" or "this is established".
- **Tinta Tautan** (link): text links, chip text, secondary-button text, bar labels. A half-step lighter than Tinta Arsip so links read as ink, not as buttons.
- **Biru Batang** (bar): bar fills in budget charts only. Hover and focus deepen a bar to Tinta Arsip.
- **Kabut Biru** (accent-soft): "Ada" status pills, active filter chips, today/hover tints, the correction band, select highlight.

### Neutral

- **Kertas Krem** (bg): page and card background. Cards are the same paper as the page, separated by a line, not by a colour step.
- **Pita Pagi** (band): the cool pale band behind page titles and the home hero.
- **Kertas Lipat** (surface): bar tracks, notes, the PPID letter preview, the pagu label chip, alternating sections.
- **Kertas Lipat Tua** (surface-strong): compact select backgrounds in the tracker.
- **Tinta Judul** (heading): headings and strong values.
- **Tinta Isi** (text): body text.
- **Tinta Pudar** (text-muted): secondary text, metadata, weekends in the calendar (6.9:1 on bg).
- **Garis Kertas** (border): card outlines and dividers.
- **Garis Tegas** (border-strong): input outlines, dashed "Belum diketahui" outlines, scrollbars.
- **Stabilo** (placeholder-bg): highlighting only: the correction contact and a just-added line in the PPID letter. Never a status colour.
- **Malam Balai** (footer), **Kertas Malam** (footer-text), **Kabut Malam** (footer-muted): the dark footer band and its text.

### Named Rules

**The No-Verdict Rule.** No red, green, or traffic-light colours anywhere. A program's status is written in words; "Belum diketahui" uses a dashed Garis Tegas outline, never a warning colour.

**The One Ink Rule.** Tinta Arsip is the only accent hue. New emphasis comes from weight, size, or Kabut Biru, not from a second accent.

**The Stabilo Rule.** Stabilo yellow marks something the reader must fill in or act on (placeholders, the correction contact, a just-added line). It never marks data.

## Typography

**Display Font:** Plus Jakarta Sans (with system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Body Font:** Plus Jakarta Sans (same stack)

**Character:** One humanist geometric sans for everything, self-hosted through next/font. Hierarchy comes from three weights and a clear size ladder, not from a second family.

### Hierarchy

- **Figure** (800, 4.5rem, 1.1): the single headline number on a region home ("10 dari 82"). One per page at most.
- **Display** (800, 3rem, 1.2): home hero and landing titles; landing uses clamp(2.25rem, 3.2vw, 3rem) with balanced wrapping.
- **Headline** (800, 2.25rem, 1.22): page titles and section titles. Drops to 1.75rem on phones.
- **Title** (600, 1.625rem, 1.3): card titles ("Status bukti", "Pagu indikatif RPJMD").
- **Title small** (600, 1.125rem, 1.45): sub-heads inside cards, program names in lists.
- **Lead** (400, 1.125rem, 1.5): page introductions, max about 60rem wide.
- **Body** (400, 1rem, 1.5): running text.
- **Label** (600, 0.875rem): form labels, buttons (15px), chips, table headers.
- **Caption** (400, 0.8125rem): sources, PDF pages, check dates, pills.

### Named Rules

**The Source Caption Rule.** Every number's source sits in Caption directly under or beside it, never in a footnote at the page end.

**The Tabular Rule.** Money, figures, table cells, and calendar days use tabular numerals so columns of rupiah align.

## Layout

A centred column of 1200px content with a 20px gutter (1240px including gutters). Pages are stacked full-width bands: a cool title band, cream content sections, an occasional Kertas Lipat section, and the navy footer. Section padding is 48px (80px for large home sections), dropping to 32px/48px on phones.

The spacing scale is 4, 8, 12, 16, 24, 32, 48, 64, 80px. Cards use 28px padding (24px on phones); cards in a stack are 24px apart.

Grids: the home hero is text plus a 420px figure column; the program detail is content plus a 420px status column; the PPID draft is a 400px column plus the letter. Program lists are table-like rows on desktop (program, pagu, evidence trail) and become cards below 1024px.

Breakpoints: 1024px (two-column layouts collapse; list rows become cards), 760px (phone type scale, single column, full-width buttons, 44px touch targets), 640px (header compaction; region picker becomes a bottom sheet), 600px (tooltips pin to the viewport bottom).

## Elevation & Depth

Flat by default. Depth comes from 1px Garis Kertas outlines and tonal bands (Pita Pagi, Kertas Lipat), never from shadows on cards. Shadows exist only for things that float above the page.

### Shadow Vocabulary

- **Popover** (`box-shadow: 0 18px 40px -14px rgb(19 38 59 / 30%), 0 2px 6px rgb(19 38 59 / 8%)`): the calendar and the themed select list.
- **Marker ring** (`box-shadow: 0 0 0 4px var(--color-bg)`): separates numbered PPID step markers from their connecting hairline. A paper-coloured gap, not depth.

### Named Rules

**The Flat Paper Rule.** Cards and sections never cast shadows. If something needs to stand out, give it a line or a band, or make it the primary action.

## Shapes

Slightly rounded, never soft. Buttons and inputs use 6px, chips and notes 8px, cards 12px, status pills and filter chips are full pills. Borders are 1px for structure; 1.25px for status pills; 1.5px for secondary buttons and checkboxes; 2px Tinta Arsip only for the Status bukti card that holds the next step. Thick coloured side borders are not part of the language.

## Components

### Buttons

Precise and calm.

- **Shape:** gently rounded (6px), 15px semibold label, 13px × 22px padding, icon gap 6px.
- **Primary:** Tinta Arsip fill, white text. Used once per task area for the main action.
- **Secondary:** transparent with a 1.5px Tinta Arsip outline and Tinta Tautan text.
- **Hover / Focus:** colour transition 160ms; focus is a 3px Tinta Arsip outline offset 2px. Disabled drops to 60% opacity.
- **Feedback:** the copy button switches to a check icon and "Tersalin" for two seconds.

### Chips

- **Example keyword chips:** cream with a Garis Tegas outline and Tinta Tautan text; hover tints Kabut Biru.
- **Active filter chips:** Kabut Biru fill, Tinta Arsip outline, with an SVG close icon; each removes one filter.
- **Pagu label chip:** Kertas Lipat, 8px radius, caption text. Mandatory beside every spending block.

### Status

- **Ada:** Kabut Biru pill with a solid Tinta Arsip outline.
- **Belum diketahui:** transparent pill with a dashed Garis Tegas outline and Tinta Pudar text.
- **Evidence trail:** Rencana, Anggaran, Bukti as small markers joined by 10px hairlines; a filled dot means evidence exists, a dashed ring means not yet known.

### Cards / Containers

- **Corner Style:** 12px.
- **Background:** Kertas Krem, the same as the page.
- **Shadow Strategy:** none (see The Flat Paper Rule).
- **Border:** 1px Garis Kertas.
- **Internal Padding:** 28px (24px on phones; 32px × 36px for the PPID letter card).

### Inputs / Fields

- **Style:** 1px Garis Tegas outline, Kertas Krem fill, 6px radius, 48px tall, label always visible above.
- **Focus:** border turns Tinta Arsip with a 1px inner ring and a 3px Kabut Biru outline.
- **Search:** a magnifier icon on the left and a themed clear button.
- **Select:** custom chevron; where the browser supports base-select (fine pointers), the dropdown list is themed with Kabut Biru for the selected option. Touch devices keep the native list.
- **Checkbox:** 20px, 6px radius, 1.5px Garis Tegas outline; checked fills Tinta Arsip with a white check that scales in.
- **Date:** a themed calendar on fine pointers (Monday first, weekends in Tinta Pudar, today outlined, selection filled); touch devices and no-JS keep the native picker.

### Navigation

Logo mark plus wordmark at the left, region picker, then four links. Links are Tinta Pudar; the current page is Tinta Judul semibold with a 2px Tinta Arsip underline. On phones the links sit in their own row with 44px touch targets; the region picker opens as a dialog on desktop and a bottom sheet on phones.

### Jejak Explorer

Signature component and the one authored motion moment. A single trail with three numbered stops (Rencana, Anggaran, Bukti) as keyboard tabs; the selected stop fills with Tinta Arsip behind a Kabut Biru ring, and the ink line extends to it (460ms). The panel states how many curated programs have a sourced document for that stage and shows one dot per program: filled for a sourced document, dashed ring for not yet known. Dots re-enter with a short stagger when the stage changes, scale on hover or focus, name their program in a caption, and open the program on click. Without JavaScript the three stages render stacked. Counts are factual coverage of evidence, never a score.

### Budget Bar Chart

Signature component. Label, track (Kertas Lipat), Biru Batang fill, then the short rupiah value with its one-decimal share. The whole row links to its field. Hover or focus tints the row Kabut Biru, deepens the bar to Tinta Arsip, and thickens the track without changing its length. The full value is in a keyboard-reachable tooltip; a caption under the label (shown on hover or focus, always shown on touch) says how many curated programs belong to that field. Bars are drawn at full length by default and grow once when the chart first scrolls into view.

## Do's and Don'ts

### Do:

- **Do** put the source document, PDF page, and check date in Caption next to every figure.
- **Do** keep "Pagu indikatif, bukan APBD dan bukan realisasi" as a chip or caption beside every spending block.
- **Do** write status in words and draw "Belum diketahui" with a dashed outline.
- **Do** use the single easing curve `cubic-bezier(0.16, 1, 0.3, 1)` with durations of 160–700ms, start every animation from a readable state, and remove all motion under reduced motion.
- **Do** keep charts and cards fully drawn by default so print, screenshots, and no-JS show final values.
- **Do** theme browser surfaces: selection in Kabut Biru, caret and accent colour in Tinta Arsip, thin scrollbars in Garis Tegas.
- **Do** use the SVG icon set (16px grid, 1.6px stroke, currentColor) for arrows, close, check, calendar, and chevrons.

### Don't:

- **Don't** use red, green, scores, rankings, or any colour that implies a verdict.
- **Don't** compare or chart figures across regions, or place program pagu (juta rupiah) and bidang pagu (rupiah) on one scale.
- **Don't** add shadows to cards or sections.
- **Don't** use thick coloured side or top borders on cards, list items, or callouts.
- **Don't** use Unicode glyphs or emoji as icons.
- **Don't** hide content until it is scrolled into view, or count numbers up.
- **Don't** introduce a second accent hue or a second typeface.
