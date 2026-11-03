# JejakJanji

Situs transparansi program prioritas RPJMD dengan struktur multi-daerah; data aktif
saat ini DKI Jakarta 2025-2029 dan pagu indikatifnya
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
git clone https://github.com/HapisHanipudin/jejakjanji.git
cd jejakjanji
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

| Rute                            | Isi                                                             |
| ------------------------------- | --------------------------------------------------------------- |
| `/`                             | Landing umum, pilih daerah atau saran lokasi dengan persetujuan |
| `/[daerah]`                     | Beranda daerah: bagan 6 bidang urusan dan cakupan kurasi        |
| `/[daerah]/program`             | Daftar program dengan filter `q`, `bidang`, `status`            |
| `/[daerah]/program/[kode]`      | Detail: indikator, pagu per tahun, sumber, status bukti         |
| `/[daerah]/program/[kode]/ppid` | Draf surat PPID, dibuat di browser                              |
| `/[daerah]/pelacak`             | Pelacak lokal versi 2, migrasi v1, ekspor/impor seluruh daerah  |
| `/[daerah]/metodologi`          | Sumber daerah, aturan status, cara membaca pagu, netralitas     |

Slug aktif: `dki-jakarta`. Rute lama `/program`, detail/PPID, `/pelacak`,
`/metodologi`, dan `/netralitas` dialihkan permanen ke Jakarta; query dipertahankan.
URL selalu menentukan konteks daerah. Daerah dikenal tetapi belum dikurasi
memiliki empty state; slug tidak dikenal 404. Pilihan tersimpan tidak melakukan
redirect. Lokasi opsional memakai BigDataCloud langsung dari browser setelah
persetujuan, lalu pengguna mengonfirmasi saran. Pemetaan lokasi baru Jakarta.

- `API_BASE_URL` (server saja) dibaca dari `.env` root; lihat `.env.example`.
- Token desain (warna, jarak, tipografi): `apps/web/src/app/tokens.css`.
- Teks hukum dan konstanta tenggat: `apps/web/src/content/legal.ts` (bertanda `TODO-REVIEW`).
- Konstanta lain yang perlu diganti: `apps/web/src/content/site.ts` (jumlah program prioritas dan kontak koreksi; kontak masih placeholder).
- Build produksi: `bun run --cwd apps/web build`, lalu `bun run --cwd apps/web start`.

## Endpoint

| Endpoint                 | Keterangan                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `GET /api/bidang-urusan` | Daftar bidang, pagu indikatif 2026 (rupiah penuh), proporsi (%)                                                    |
| `GET /api/program`       | Query opsional `bidang`, `status` (`ada`/`belum_diketahui`, status bukti pelaksanaan), `q` (nama atau awalan kode) |
| `GET /api/program/:kode` | Detail, pagu per tahun (juta rupiah), evidence, sumber, status bukti                                               |
| `GET /api/sumber`        | Dokumen sumber, versi, tanggal cek                                                                                 |

`GET /api/daerah` mengembalikan metadata daerah. Daftar program, bidang, dan
sumber menerima `?daerah=dki-jakarta` atau `?daerah=31`; default Jakarta.
`GET /api/daerah/:daerah/program/:kode` adalah detail regional; endpoint detail
lama tetap Jakarta. Daerah tidak dikenal 404; belum dikurasi mengembalikan data
kosong beserta metadata status (detail `null`). Tidak ada agregasi lintas daerah.

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

## Tech stack

Panduan persiapan dan deployment Cloudflare Workers + Neon: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Next.js dan React untuk web; Hono di Cloudflare Workers untuk API; PostgreSQL, Drizzle ORM, Zod, dan bun workspaces. Tailwind CSS v4 dan token CSS untuk tampilan; Vitest untuk tes.

## Progress first draft

Enam layar dan empat endpoint baca sudah tersedia, berikut CSV 10 program dan 44 bidang urusan, migrasi, seed, draf PPID, serta pelacak lokal. Cakupan data awal adalah 10 dari 82 program prioritas daerah (RPJMD Tabel III.28, mulai PDF 337, diperiksa 22 Oktober 2026).

API sudah di-deploy ke Cloudflare Workers dan terhubung ke PostgreSQL Neon melalui Hyperdrive; lihat docs/DEPLOYMENT.md untuk URL dan hasil verifikasi. Web sedang disiapkan untuk Workers melalui OpenNext. Teks hukum PPID belum ditinjau; hitungan hari kerja belum memasukkan hari libur. Uji pengguna belum dilakukan. Kontak koreksi di halaman Metodologi masih placeholder. Screenshot di docs/screenshots/contoh-data-fiktif tidak boleh dipakai untuk PDF lomba.

Hasil verifikasi sesi ini dicatat di docs/first-draft-verification.md; keberadaan kode tidak berarti seluruh alur telah diuji.

Implementasi multi-daerah lokal, bukti preservasi data, rollback aman, dan batas
pengujian: [docs/multi-daerah-verification.md](docs/multi-daerah-verification.md).
Status commit, preview, dan migrasi setelah izin pengguna dicatat di
[docs/preview-verification.md](docs/preview-verification.md). Untuk tes integrasi, lihat
`TEST_DATABASE_URL` di `.env.example`; jangan gunakan database pengembangan/produksi.
