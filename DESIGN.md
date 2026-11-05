---
name: JejakJanji
description: Lembar kerja pemeriksa program daerah — tinta arsip di atas kertas krem, setiap angka dengan rujukannya.
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
    lineHeight: 1.2
  headline:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 800
    lineHeight: 1.22
  title:
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
    fontSize: '1.75rem'
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

# Design System: JejakJanji — Redesign

## Authority

Visual source: [Figma Redesign](https://www.figma.com/design/Lq7xYDmjODYgZpJ7jE6F3Z?node-id=135-1285). Use new 143 nodes, never the 135 V4 copies. Components: 143:49362. Desktop/mobile pairs: Beranda 143:46269/143:46441; Daftar 143:46607/143:47023; Detail 143:47434/143:47601; PPID 143:47768/143:47894; Pelacak 143:48020/143:48169; Metodologi 143:48318/143:48425; not found 143:48532/143:48586; uncurated 143:48640/143:48689; error 143:48738/143:48787; region dialog 143:48836/143:49034; empty tracker 143:49226/143:49294.

## Direction

A civic reading desk: cream page, white working surfaces, navy actions and a navy home hero. The pale blue band groups the three evidence stages. Footer continues the cream page with a hairline divider. ENERGY 2 / RHYTHM 3 / MOTION 2. Landing is Persuade; program, PPID and tracker are Operate; methodology is Read.

## Color and typography

Background #f7f4ec, surfaces #ffffff, text #17202a, muted #4f5b66, navy #1f4e79, pale blue #dce8f3, borders #d5cfc0 and #6b7480, chart #5b84ab. Hero text #f4f1e8 and secondary #b9c8d8. Plus Jakarta Sans throughout; 400 body, 600 labels, 800 strong headings. Body 16px/1.6; secondary 14px; captions 13px; card titles 28px; sections 36px; desktop hero 56px. Existing responsive type scale reduces these on phones. Numbers remain tabular.

## Spacing and layout

4/8/12/16/24/32/48/64/80px scale. Maximum content width 1200px, fluid gutters. Two program cards per row on desktop and one on phones. Detail keeps content plus evidence sidebar; PPID keeps form plus letter. Collapse task columns at 1024px; phone treatment at 760px; region dialog becomes a bottom sheet at 640px. Real text determines height; no screenshot-height clipping.

## Components and states

White cards use 16px radius, 1px warm border, 24–32px padding, no card shadows. Buttons and inputs retain 6px radius. Primary actions are navy with white text; on navy hero invert primary action to white/navy. Inputs have explicit labels, visible focus, native touch affordances. Controls keep 44px touch targets. Region picker is a white modal/bottom sheet with search, current selection and coverage labels.

Evidence status remains neutral: Ada uses pale blue and solid outline; Belum diketahui uses text and dashed outline. Belum dikurasi describes region coverage only. Empty/error states retain recovery controls and honest messages. PPID letter is a white reading surface; tracker records remain local. Source document, PDF page, check date, full money tooltip and mandatory indicative-budget label stay available.

## Motion

Preserve header shape transition: 420ms cubic-bezier(0.22,1,0.36,1), widening and thinning in both directions with fixed layout space. Desktop 90 to 62px; phone 82 to 62px. Mobile menu closes by button, Escape or navigation. Existing demo remains automatic with manual selection, radio choices, play/pause and previous/next. Reduced motion disables animation and autoplay. Focus outlines remain visible.

## Adaptations

Figma sample money, dates, documents, categories and tracker records are excluded. API and verified content own all facts. National landing retains multi-region entry and simulation label. Header hamburger and shape animation override the static Figma navigation. Existing evidence explorer, chart and tracker v2 import/export/migration remain functional. No scores, accounts, dark mode, splash screen or backend additions.
