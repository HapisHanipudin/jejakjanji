# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users, still hypotheses until interviews and task tests are done:

- **Students and campus press** (proto-persona: a political-science student writing a mid-term evaluation for the campus paper). Mostly on a phone; needs official references a lecturer or editor can check.
- **Local journalists.** Mostly on a laptop; need the right figure and its source page quickly, and must be able to quote it without misreading it.

Secondary: citizens who follow regional issues and want to check claims circulating on social media. Residents outside Jakarta matter only once their region is curated; until then they can send RPJMD documents through the correction contact.

Their job: find an official priority program, read its indicator, target, and indicative budget, see what evidence exists for it, and, when evidence is missing, request it from the PPID and track the response deadline.

## Product Purpose

JejakJanji (working name) helps citizens check the priority programs in a region's RPJMD 2025–2029: which programs are officially listed, their indicative budget, and what evidence of implementation is available. When evidence is not found, the site helps the user draft a public-information request to the PPID, which the user sends themself, and track the expected deadline on their own device.

Success, as proposed decision criteria (not research results): 4 of 5 test participants find a program's 2026 budget and its PDF page within 2 minutes; 4 of 5 explain "Belum diketahui" correctly; 4 of 5 build and download a PPID draft; 100% of curated figures match the PDF in a two-person audit; Daftar LCP at most 2.5 s on 4G.

## Positioning

For students and journalists who need to check regional programs, JejakJanji is a fast route to the official documents: what is written, what evidence exists, and how to request it when it does not. Unlike government data portals, it assembles evidence per program; unlike rating sites, it gives no scores. Every figure carries its source document, PDF page, and check date, and an unknown status is shown as unknown, never as failure.

## Operating Context

- Sources: RPJMD DKI Jakarta 2025–2029 (Perda 2/2025, 393 pages; priority programs in Tabel III.28 from PDF page 337) and RKPD DKI Jakarta 2026 (Pergub 21/2025, 549 pages; budget per bidang urusan in Tabel 5.16–5.23, PDF pages 480–483), both from Bappeda DKI Jakarta.
- Curation: curators read the PDFs, fill Google Sheets with page numbers, export them to `data/*.csv`, and seed the database; a second reviewer checks figures against the PDF before they are marked verified.
- Follow-up: the user copies or downloads the PPID draft and sends it through the region's official PPID channel outside the site, then records the send date in the browser-only tracker.
- Evaluation: built for the Web In Action competition (MIA 2026): final submission 11 November 2026, onsite demo 28 November 2026 if selected.

## Capabilities and Constraints

- Regional pages per region (`/[daerah]`): home with search and an indicative budget chart per bidang urusan, program list with filters, program detail, PPID draft, request tracker, and methodology. A general landing page at `/` lets the user choose a region.
- Multi-region structure; only DKI Jakarta is active (code `31`, slug `dki-jakarta`), with 10 of 82 priority programs curated. Never add regions, documents, figures, or contacts that are not curated from official sources.
- Two different statuses: "Belum dikurasi" describes a region's data coverage; "Belum diketahui" describes the availability of evidence for one program stage (rencana, anggaran, pelaksanaan). Neither is a judgement of failure.
- Every spending figure carries the label "Pagu indikatif, bukan APBD dan bukan realisasi". Program budgets are in juta rupiah and bidang urusan budgets in full rupiah; they are never summed or compared.
- No accounts, no server storage of personal data, and no free text sent to the server. The site never sends a PPID request on the user's behalf; drafts and tracker data stay in the browser.
- PPID legal text and deadline rules live in one constants file marked TODO-REVIEW and still await team review; deadline estimates count working days only and do not include public holidays.
- The optional "Gunakan lokasi saya" suggestion asks for consent, sends coordinates and IP to a third-party provider, and maps only ID-JK; whether to keep it is an open team decision.
- Interface and API messages in Indonesian; code identifiers in English.
- Open decisions: final product name (JejakJanji is the working name), long-term production Postgres host, legal reviewer for the PPID text, pilot region, and the location feature.

## Brand Commitments

- Name: JejakJanji is the working name used in code and interface; the final name is undecided.
- Voice: descriptive, plain Indonesian; no evaluative adjectives about government performance, no campaign promises, party names, or calls to vote.
- Correction contact: support@jejakjanji.id (receipt not yet tested).

## Evidence on Hand

- Curated data: 10 programs, 44 bidang urusan, 50 yearly budget rows, and 10 evidence rows, in `data/program.csv` and `data/bidang_urusan.csv`, seeded to the development database.
- Product, technical, and verification documents in `docs/` (product spec, decisions, sources, preview, location, motion, and UI refinement verification).
- No user interviews, task tests, testimonials, usage data, partners, or press exist yet. Do not invent them, and do not claim figures are audited beyond what the verification documents record.

## Product Principles

1. Every figure is traceable: source document, PDF page, and check date sit next to it.
2. Neutral, not a report card: no scores, rankings, or cross-region comparisons; status is written in words, never in red or green alone.
3. Honest about the unknown: "Belum diketahui" is as visible as "Ada" and always comes with a next step.
4. The citizen acts, the site prepares: drafts and records live on the user's device; nothing is sent for them.
5. Each region stands alone: a region is shown with its own sources, and uncurated regions are labeled, not hidden or ranked.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast at least 4.5:1 (3:1 for large text and UI components), full keyboard use with visible focus, status never conveyed by color alone, visible form labels, touch targets of at least 44 × 44 px on mobile, and a text alternative for the budget charts. Plain Indonesian, with budget terms explained on the methodology page. Motion respects reduced-motion preferences.
