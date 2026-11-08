# JejakJanji

Situs transparansi program prioritas RPJMD dengan struktur multi-daerah; data aktif
saat ini DKI Jakarta 2025-2029 dan pagu indikatifnya
(lomba Web In Action, MIA 2026). Setiap angka punya sumber, halaman PDF, dan tanggal cek.
Semua angka belanja adalah **pagu indikatif, bukan APBD dan bukan realisasi**.

## Tujuan

Masalah: program prioritas daerah tersebar di dokumen RPJMD dan RKPD ratusan halaman. Warga sulit
memeriksa program apa yang direncanakan, berapa pagunya, dan bukti apa yang sudah tersedia.

JejakJanji punya tiga tujuan (rincian di [docs/product-spec.md](docs/product-spec.md)):

1. Warga menemukan program prioritas RPJMD beserta halaman rujukannya dalam satu tampilan.
2. Setiap angka pagu tampil dengan satuan, sumber, halaman PDF, tanggal cek, dan label pagu indikatif.
3. Warga dapat bertindak lewat jalur resmi: draf permohonan PPID dan pelacak tenggat.

Bukan tujuan: skor, peringkat, atau penilaian kinerja kepala daerah; menyatakan janji ditepati
atau diingkari; akun pengguna. Bila bukti belum ada, status ditulis "belum diketahui", bukan gagal.

## Fitur utama

- **Daftar dan detail program**: filter bidang, status bukti, dan pencarian; indikator, pagu per
  tahun, dan kotak sumber dengan halaman PDF.
- **Status bukti netral**: "ada" hanya bila bukti punya dokumen sumber; selain itu "belum
  diketahui" (garis putus-putus, tidak merah).
- **Draf permohonan PPID**: dibuat di browser, lalu disalin, dibagikan (Web Share di HP), dibuka di
  aplikasi email, atau diunduh .txt. Situs tidak mengirim permohonan dan tidak menyimpan isian.
- **Pelacak permohonan**: catat tanggal kirim dan tenggat jawaban di `localStorage`; ekspor dan impor
  JSON untuk cadangan, dengan peringatan bahwa data hanya ada di browser.
- **Struktur multi-daerah**: URL `/[daerah]/...` dan tabel per `daerah_kode`; data aktif saat ini
  DKI Jakarta.

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
- Metadata editorial dan kontak koreksi: `apps/web/src/content/site.ts`; kontak tim `support@jejakjanji.id`.
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

## Menambah daerah

Komponen web dan endpoint API tidak perlu diubah: rute `/[daerah]` dan semua tabel sudah memakai
`daerah_kode`. Daerah yang terdaftar tetapi berstatus `BELUM_DIKURASI` sudah tampil sebagai empty
state. Langkah untuk mengaktifkan daerah baru:

1. Audit dokumen RPJMD dan RKPD daerah itu; catat di [docs/SOURCES.md](docs/SOURCES.md).
2. Tambahkan baris program dan bidang urusan ke `data/*.csv` dengan `daerah_kode` baru
   (format di [data/README.md](data/README.md)). Jangan mengisi data karangan.
3. Ubah `scripts/seed.ts`: seed saat ini sengaja hanya menerima `daerah_kode` `31` (skema zod CSV,
   dokumen sumber, baris tabel `daerah`, dan filter evidence). Ini perubahan yang belum dikerjakan.
4. Jalankan `bun run db:seed`, lalu periksa `/[slug-daerah]` dan
   `GET /api/program?daerah=<kode>`.

## Status saat ini

Enam layar dan empat endpoint baca sudah tersedia, berikut CSV 10 program dan 44 bidang urusan, migrasi, seed, draf PPID, serta pelacak lokal. Cakupan data awal adalah 10 dari 82 program prioritas daerah (RPJMD Tabel III.28, mulai PDF 337, diperiksa 22 Oktober 2026).

Setelah umpan balik mentor FDS (8 November 2026): draf PPID mendapat tombol Bagikan dan Buka di
aplikasi email, serta pratinjau surat yang lebih pendek di HP supaya tombol aksi tetap terlihat.
Diuji di lebar 375px; tombol Bagikan belum diuji di perangkat HP sungguhan.

API dan web preview multi-daerah tersedia pada Worker terpisah; lihat
[docs/preview-verification.md](docs/preview-verification.md) untuk URL, migrasi
development yang disetujui, dan hasil uji. Teks hukum PPID menunggu persetujuan
akhir tim; hitungan hari kerja belum memasukkan hari libur. Uji pengguna formal
belum dilakukan. Kontak koreksi sudah diisi. Screenshot di
docs/screenshots/contoh-data-fiktif tidak boleh dipakai untuk PDF lomba.

Hasil verifikasi sesi ini dicatat di docs/first-draft-verification.md; keberadaan kode tidak berarti seluruh alur telah diuji.

Implementasi multi-daerah lokal, bukti preservasi data, rollback aman, dan batas
pengujian: [docs/multi-daerah-verification.md](docs/multi-daerah-verification.md).
Status commit, preview, dan migrasi setelah izin pengguna dicatat di
[docs/preview-verification.md](docs/preview-verification.md). Untuk tes integrasi, lihat
`TEST_DATABASE_URL` di `.env.example`; jangan gunakan database pengembangan/produksi.
