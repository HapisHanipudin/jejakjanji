# JejakJanji

Situs transparansi program prioritas RPJMD DKI Jakarta 2025-2029 dan pagu indikatifnya
(lomba Web In Action, MIA 2026). Setiap angka punya sumber, halaman PDF, dan tanggal cek.
Semua angka belanja adalah **pagu indikatif, bukan APBD dan bukan realisasi**.

## Struktur

| Folder            | Isi                                                                              |
| ----------------- | -------------------------------------------------------------------------------- |
| `apps/web`        | Next.js App Router (6 layar wireframe), lihat bagian Web di bawah                |
| `apps/api`        | API Hono di Cloudflare Workers                                                   |
| `packages/shared` | Skema Drizzle, skema zod respons API, `formatRupiahRingkas`, `hitungStatusBukti` |
| `data/`           | CSV sumber data (lihat `data/README.md`)                                         |
| `scripts/`        | `seed.ts`                                                                        |
| `drizzle/`        | Migrasi SQL hasil `drizzle-kit generate`                                         |
| `docs/`           | `DECISIONS.md`, `SOURCES.md`                                                     |

## Menjalankan lokal

Prasyarat: [bun](https://bun.com) 1.4.4 (package manager dan penjalan skrip), Node.js 24+
(Wrangler, Next.js, drizzle-kit, dan vitest tetap berjalan di Node), Docker.

```sh
bun install
cp .env.example .env          # ubah POSTGRES_PORT dan kedua URL bila port 5432 sudah terpakai

docker compose up -d --wait   # 1. Postgres lokal
bun run db:migrate            # 2. terapkan migrasi di drizzle/
bun run db:seed               # 3. isi data dari data/*.csv (gagal bila CSV belum ada)
bun run dev                   # 4. API di http://127.0.0.1:8787 (wrangler dev)
bun run dev:web               # 5. web di http://localhost:3000 (membaca API lewat API_BASE_URL)
```

Bila port 8787 terpakai: `bun run dev --port 8788` dan ubah `API_BASE_URL` di `.env`.

Contoh:

```sh
curl http://127.0.0.1:8787/api/program
curl http://127.0.0.1:8787/api/program/2.11.11
```

## Web (`apps/web`)

| Rute                   | Isi                                                                       |
| ---------------------- | ------------------------------------------------------------------------- |
| `/`                    | Beranda: hero, bagan 6 bidang urusan dengan pagu terbesar, tiga kartu     |
| `/program`             | Daftar program dengan filter `q`, `bidang`, `status` (form GET, tanpa JS) |
| `/program/[kode]`      | Detail: indikator, pagu per tahun, sumber, status bukti                   |
| `/program/[kode]/ppid` | Draf surat permohonan PPID, dibuat di browser                             |
| `/pelacak`             | Pelacak permohonan di `localStorage` browser, ekspor/impor JSON           |
| `/metodologi`          | Dokumen sumber, aturan status, cara membaca pagu, netralitas              |
| `/netralitas`          | Dialihkan ke `/metodologi#netralitas`                                     |

- `API_BASE_URL` (server saja) dibaca dari `.env` root; lihat `.env.example`.
- Token desain (warna, jarak, tipografi): `apps/web/src/app/tokens.css`.
- Teks hukum dan konstanta tenggat: `apps/web/src/content/legal.ts` (bertanda `TODO-REVIEW`).
- Konstanta lain yang perlu diganti: `apps/web/src/content/site.ts` (jumlah program RPJMD, kontak koreksi).
- Build produksi: `bun run --cwd apps/web build`, lalu `bun run --cwd apps/web start`.

## Endpoint

| Endpoint                 | Keterangan                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `GET /api/bidang-urusan` | Daftar bidang, pagu indikatif 2026 (rupiah penuh), proporsi (%)                                                    |
| `GET /api/program`       | Query opsional `bidang`, `status` (`ada`/`belum_diketahui`, status bukti pelaksanaan), `q` (nama atau awalan kode) |
| `GET /api/program/:kode` | Detail, pagu per tahun (juta rupiah), evidence, sumber, status bukti                                               |
| `GET /api/sumber`        | Dokumen sumber, versi, tanggal cek                                                                                 |

Respons yang memuat uang menyertakan `"label": "Pagu indikatif, bukan APBD dan bukan realisasi"`.
Error selalu berbentuk `{ "error": { "kode", "pesan", "detail"? } }`.

## Perintah lain

```sh
bun run typecheck     # tsc untuk root, shared, api, web
bun run lint          # eslint + prettier --check
bun run test          # vitest (jangan `bun test`: itu test runner bawaan bun)
bun run db:generate   # buat migrasi baru setelah mengubah packages/shared/src/schema.ts
bun run --cwd apps/api cf-typegen   # perbarui worker-configuration.d.ts setelah ubah wrangler.toml
```
