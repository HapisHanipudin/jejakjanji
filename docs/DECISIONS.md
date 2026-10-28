# Keputusan

## Ditetapkan oleh tim (final)

- Monorepo dengan bun workspaces (sebelumnya pnpm, lihat "Package manager: bun"), TypeScript strict.
- API terpisah: Hono di Cloudflare Workers (Wrangler). Web: Next.js (`apps/web`).
- ORM Drizzle, database PostgreSQL. Validasi zod, tes vitest.
- Host PostgreSQL belum diputuskan. Tooling memakai `DATABASE_URL`; Postgres lokal lewat `docker-compose.yml`.
- Tanpa akun, tanpa skor atau peringkat kepala daerah.
- Status bukti dihitung dari tabel `evidence`, tidak disimpan sebagai kolom. Bawaan `belum_diketahui`,
  dan itu bukan penilaian bahwa program gagal.
- Semua angka belanja berlabel "Pagu indikatif, bukan APBD dan bukan realisasi".
- Bahasa antarmuka dan pesan API: Indonesia. Identifier kode: Inggris (nama tabel/kolom mengikuti spesifikasi).

## Koneksi Postgres dari Workers: Hyperdrive + node-postgres (`pg`)

**Pilihan:** binding Cloudflare Hyperdrive (`HYPERDRIVE`) dengan driver `pg` dan
`drizzle-orm/node-postgres`, satu `pg.Client` baru per request, `compatibility_flags = ["nodejs_compat"]`.

**Dasar (dibaca 2026-10-22):**

- Cloudflare, "Drizzle ORM" di dokumentasi Hyperdrive
  (https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/drizzle-orm/):
  memakai `pg` + `drizzle-orm/node-postgres`, membuat `Client` per request dengan
  `env.HYPERDRIVE.connectionString`, dan butuh `nodejs_compat`. Dokumen itu juga menyatakan
  Postgres.js tidak didukung untuk pola ini.
- Cloudflare, "Local development" Hyperdrive
  (https://developers.cloudflare.com/hyperdrive/configuration/local-development/):
  `wrangler dev` memakai `localConnectionString` atau variabel
  `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_<BINDING>`.

**Alasan:**

- Host Postgres belum dipilih. Hyperdrive bekerja dengan Postgres apa pun yang bisa dijangkau lewat
  TCP, jadi tidak mengunci pilihan host. Driver serverless (mis. Neon HTTP) mengikat ke satu penyedia.
- Hyperdrive yang mengelola pool koneksi, jadi `Client` per request tidak membuka koneksi baru ke DB asal.
- Kode API sama persis di lokal dan produksi; hanya sumber connection string yang berbeda.

**Konsekuensi:**

- `wrangler.toml` berisi `id` Hyperdrive **placeholder** (`000...0`). Ganti dengan id dari
  `wrangler hyperdrive create` setelah host dipilih. Tidak ada id atau secret asli di repo.
- Lokal, `bun run dev` menjalankan `wrangler dev --env-file ../../.env` sehingga
  `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` dari `.env` root dipakai.
  `localConnectionString` sengaja tidak ditulis di `wrangler.toml` agar kredensial tidak masuk repo.
- Klien `pg` ditutup lewat `executionCtx.waitUntil(client.end())` setelah respons.

## Keputusan yang diambil saat scaffold

- **Kunci alami `source_document`:** `unique(type, version)` ditambahkan agar seed bisa upsert tanpa
  menulis id secara manual. `id` tetap `serial`.
- **Bigint sebagai `number`:** `pagu_indikatif_2026` (rupiah penuh) dan `jumlah_juta_rp` dibaca sebagai
  `number` JS. Nilai realistis (~1e14) jauh di bawah `Number.MAX_SAFE_INTEGER` (~9e15); seed menolak
  angka di atas batas itu. `proporsi` (`numeric`) juga dibaca sebagai `number`.
- **Arti "ada" pada status bukti:** jenis bukti bernilai `ada` hanya bila ada baris `evidence` jenis itu
  yang punya `source_document_id`. Baris yang hanya berisi `cakupan_pencarian` mencatat pencarian
  yang belum menemukan bukti, jadi tetap `belum_diketahui`.
- **Filter `status` di `/api/program`** dihitung di JS dengan `hitungStatusBukti` (satu aturan, satu tempat).
  Cukup untuk ratusan program; pindah ke SQL bila jumlah program jauh lebih besar.
- **Daftar program** menyertakan `pagu2026` (juta rupiah) beserta `sourceDocumentId` dan `pageRef`, agar
  angka di daftar pun punya sumber. Tanggal cek ada di `/api/sumber`.
- **Pencarian `q`:** `ILIKE` pada nama (mengandung) dan kode (awalan). Karakter `%`, `_`, `\` di-escape.
- **Urutan kode** memakai perbandingan numerik per segmen (`2.2` sebelum `2.11`).
- **Pesan validasi zod** memakai locale Indonesia (`z.config(z.locales.id())`).
- **Format error seragam:** `{ error: { kode, pesan, detail? } }` untuk 400, 404, dan 500.
- **CORS:** origin diizinkan diatur lewat `CORS_ORIGINS` (dipisah koma) di `[vars]` `wrangler.toml`.
- **Seed:**
  - Semua baris divalidasi lebih dulu; bila ada satu masalah, seed berhenti dan mencetak semua masalah
    beserta nomor baris CSV. Tidak ada yang ditulis ke DB.
  - Semua tulisan dalam satu transaksi. Upsert dengan `ON CONFLICT` pada `bidang_urusan.kode`,
    `program.kode`, `funding(program_kode, tahun, jenis)`, `source_document(type, version)`.
  - `program.verified` tidak ditimpa saat seed ulang (diisi manusia setelah verifikasi).
  - Evidence `RENCANA` per program (sumber RPJMD, `page_ref` = halaman program): `evidence` tidak punya
    kunci unik, jadi seed mencari baris yang sudah ada lalu update atau insert.
  - Angka bulat menerima titik ribuan; koma ditolak alih-alih ditebak. Desimal memakai koma.
  - Kolom `Sumber` CSV harus menyebut tepat satu dari `RPJMD`/`RKPD`.
  - Sel pagu kosong tidak menghasilkan baris `funding`.
  - Pagu tahun 2030 ikut disimpan karena ada di CSV, walau periode RPJMD 2025-2029.
- **Port Postgres lokal** bisa diubah lewat `POSTGRES_PORT` di `.env` (dipakai `docker-compose.yml`).
- **TypeScript:** `tsc` adalah TypeScript 7 (paket `@typescript/native`). Paket `typescript` di-alias ke
  `@typescript/typescript6` karena typescript-eslint belum mendukung API TS 7, sesuai panduan
  "running side-by-side" di pengumuman TypeScript 7.0.
- **Tipe Worker** dibuat dengan `wrangler types` (`apps/api/worker-configuration.d.ts`), bukan `@cloudflare/workers-types`.
- **Impor dengan ekstensi `.ts`** (`allowImportingTsExtensions`) di `packages/shared`; paket ini tidak di-build,
  dikonsumsi langsung sebagai sumber TS oleh Wrangler dan tsx (web belum memakainya).

## Package manager: bun (menggantikan pnpm)

**Keputusan:** bun 1.4.4 (rilis stabil terbaru per 2026-10-22) dipakai sebagai package manager dan
penjalan skrip. Alasan: preferensi tim. Ini migrasi tooling saja; kode fitur, skema, dan perilaku API
tidak berubah.

**Yang tidak berubah:**

- Runtime API tetap workerd lewat Wrangler. bun tidak menjalankan kode Worker.
- Wrangler, Next.js, drizzle-kit, eslint, prettier, dan vitest tetap berjalan di Node (shim `.bin` bun
  memakai shebang `node`; tidak ada flag `--bun`). Next.js tidak dijalankan dengan `--bun`.
- Tes tetap vitest (`bun run test`), bukan `bun test`.

**Rincian:**

- Workspaces didefinisikan di `package.json` root (`"workspaces": ["apps/*", "packages/*"]`);
  referensi antarpaket tetap `"workspace:*"` (sintaks sama di bun).
- `packageManager` = `bun@1.4.4`. Lockfile `bun.lock` (teks) masuk repo.
- `bun.lock` awalnya dibuat dengan migrasi otomatis dari `pnpm-lock.yaml` (`bun install --lockfile-only`)
  agar versi dependensi sama persis dengan sebelumnya; setelah itu `pnpm-lock.yaml`,
  `pnpm-workspace.yaml`, dan semua `node_modules` dihapus lalu `bun install` dijalankan dari bersih.
- bun tidak menjalankan lifecycle script dependensi kecuali yang dipercaya. `trustedDependencies` =
  `["esbuild", "workerd"]` (setara `allowBuilds` pnpm sebelumnya). Field ini menggantikan daftar bawaan
  bun, jadi `sharp` dan `unrs-resolver` tetap tidak menjalankan script, sama seperti di pnpm.
- bun memakai linker "isolated" untuk workspace (`node_modules/.bun/`), mirip struktur pnpm.
- `db:seed` sekarang `bun scripts/seed.ts`: bun menjalankan TypeScript langsung dan memuat `.env`
  otomatis, sehingga `tsx` dihapus dari dependensi. Diuji dengan `pg` di bawah bun (insert dan upsert).
- `typecheck` root: `tsc -p . && bun run --workspaces typecheck`.
- **Skrip `dev` root** memakai `bun run --cwd apps/api dev` (dan `--cwd apps/web` untuk web). Saat migrasi,
  `bun run --filter @jejakjanji/api dev` sempat terlihat menggantung di port 8788. Penyebabnya ternyata
  proses `wrangler dev`/`workerd` yatim dari sesi pnpm sebelumnya yang masih memegang port 8788 setelah
  `node_modules` dihapus, bukan bun. Setelah proses itu dimatikan, `--filter` bekerja normal (diuji
  2026-10-22). `--cwd` tetap dipakai karena output-nya tanpa prefiks per paket. Pelajaran: bila
  `wrangler dev` menggantung, cek dulu proses `workerd.exe` lama dan port yang dipakai.

## Web (`apps/web`)

- **Next.js 16.4.2** (dari `create-next-app@latest`), App Router, TypeScript strict (`tsconfig` mewarisi
  `tsconfig.base.json`). Kode di `apps/web/src/`. Tanpa adapter deploy; hosting web belum diputuskan.
- **Token desain: Tailwind v4 `@theme static`** di satu berkas `src/app/tokens.css` (diimpor dari
  `globals.css` setelah `@import 'tailwindcss'`). Setiap token jadi CSS variable sekaligus utility
  (`bg-surface`, `font-mono`). Palet warna bawaan Tailwind dihapus (`--color-*: initial`) supaya hanya
  warna token yang tersedia. Preflight Tailwind tidak diimpor (hanya `theme.css` dan `utilities.css`)
  karena komponen ditulis di atas gaya bawaan browser; preflight menghapus bullet daftar, tebal heading,
  dan garis bawah tautan. Desainer cukup mengubah satu berkas. Tampilan masih wireframe lo-fi (abu-abu, aksen
  `#2f5d8a` hanya untuk tombol utama).
- **`cacheComponents` dimatikan** (create-next-app menyalakannya bawaan). Dengan Cache Components,
  `notFound()` setelah streaming dimulai tetap berstatus 200 (dokumentasi Next "Streaming > Status
  codes"), dan setiap pengambilan data harus dibungkus `<Suspense>`. Tanpa itu, halaman data
  dirender per request (`connection()` di `src/lib/data.ts`), data selalu segar, dan kode program yang
  tidak ada memberi HTTP 404 asli. Cache bisa ditambahkan nanti bila ada kebutuhan performa.
- **Data dari API:** `src/lib/api.ts` memanggil `API_BASE_URL` (variabel server, tidak pernah dikirim ke
  browser), memvalidasi setiap respons dengan skema zod dari `@jejakjanji/shared`, dan tidak pernah
  melempar error: kegagalan dikembalikan sebagai pesan Indonesia untuk ditampilkan sebagai keadaan error.
  `API_BASE_URL` dibaca dari `.env` root lewat `process.loadEnvFile` di `next.config.ts`.
- **`transpilePackages: ['@jejakjanji/shared']`** karena paket itu berisi sumber TypeScript. Komponen
  klien mengimpor subpath `@jejakjanji/shared/format` dan `/status` (ditambahkan ke `exports`) agar
  skema Drizzle tidak ikut ke bundel browser.
- **Perubahan API (aditif):** `GET /api/program` kini juga mengembalikan `paguPerTahun` per program
  (tahun, juta rupiah, sumber, halaman), karena kartu daftar butuh "Total 2026-2030". Field lama tidak
  berubah. Skema zod di `packages/shared` diperbarui.
- **Total pagu** dijumlahkan dari angka per tahun; label rentang hanya "2026-2030" bila kelima tahun ada.
- **Tooltip angka uang** (`Money`): nilai ringkas bisa difokus keyboard dan terhubung ke tooltip lewat
  `aria-describedby`; tooltip tampil saat hover atau fokus (CSS). Belum bisa ditutup dengan Escape.
- **Kartu program**: tautan judul direntangkan ke seluruh kartu (pseudo-element), supaya angka uang
  di dalam kartu tetap bisa difokus tanpa elemen interaktif bersarang.
- **Status bukti** di UI memakai garis solid (ada) atau putus-putus (belum diketahui) plus teks, tidak
  pernah hanya warna. "Belum diketahui" tidak memakai merah.
- **"Sudah dikurasi"** di beranda = jumlah program yang dikembalikan API. Angka 82 program prioritas daerah bersumber pada
  RPJMD Tabel III.28, mulai PDF 337, diperiksa 22 Oktober 2026; disimpan di `TOTAL_PROGRAM_RPJMD`.
- **"Dipakai untuk"** pada tabel dokumen sumber adalah teks editorial per tipe dokumen
  (`DIPAKAI_UNTUK` di `site.ts`), karena API tidak punya field itu.
- **Bagan bidang urusan**: API tidak punya nomor tabel, jadi baris sumber hanya menampilkan dokumen,
  halaman PDF, dan tanggal cek.
- **Draf PPID dan Pelacak** adalah Client Component; tidak ada data pemohon yang dikirim ke server.
  Teks hukum dan konstanta tenggat (10 dan 7 hari kerja) ada di `src/content/legal.ts` bertanda
  `TODO-REVIEW`. Hari kerja = Senin sampai Jumat; hari libur belum diperhitungkan.
- **Pelacak**: kunci `localStorage` `jejakjanji.pelacak`, bentuk `{ versi: 1, permohonan: [...] }`
  divalidasi zod saat dibaca dan saat impor; data rusak diabaikan dengan pesan. Impor mengganti
  semua data (dengan konfirmasi).
- **Nama komponen** dalam bahasa Inggris sesuai aturan identifier: `Header`, `Footer`, `ProgramCard`
  (Kartu Program), `StatusBadge` (Lencana Status), `Money` (Angka Uang), `BarChart` (Bagan Batang),
  `SourceBox` (KotakSumber), `PpidDraft`, `RequestTracker` (Pelacak).
