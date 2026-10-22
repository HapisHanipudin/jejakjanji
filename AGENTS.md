# JejakJanji

Situs transparansi program prioritas RPJMD DKI Jakarta 2025-2029 untuk lomba Web In Action (MIA 2026). Spesifikasi lengkap: `docs/product-spec.md`. Keputusan teknis: `docs/DECISIONS.md`. Sumber data: `docs/SOURCES.md`.

## Aturan produk (tidak boleh dilanggar tanpa persetujuan PM)

- Setiap angka punya dokumen sumber, halaman PDF, dan tanggal cek.
- Semua angka belanja berlabel "Pagu indikatif, bukan APBD dan bukan realisasi".
- Tanpa skor, peringkat, atau penilaian kinerja kepala daerah.
- "Belum diketahui" adalah status bawaan dan netral: garis putus-putus, bukan merah, dan tidak boleh dibedakan hanya lewat warna. Jangan pernah menyiratkan program gagal.
- Tanpa akun dan tanpa teks bebas pengguna yang dikirim ke server. Situs tidak mengirim permohonan atas nama pengguna; draf PPID hanya disalin atau diunduh.
- Jangan mengarang data, kutipan hukum, tenggat, atau klaim. Teks hukum dan hitungan tenggat PPID hidup di satu berkas konstanta bertanda TODO-REVIEW dan belum diverifikasi tim.
- Pagu program (juta rupiah) dan pagu bidang urusan (rupiah penuh) berbeda satuan; jangan dijumlahkan atau dibandingkan langsung.
- Bahasa antarmuka dan pesan API: Indonesia. Identifier kode: Inggris.

## Struktur

- `apps/web`: Next.js (App Router, TypeScript). Server Component untuk data; Client Component untuk Pelacak (localStorage) dan pembuatan draf PPID.
- `apps/api`: Hono di Cloudflare Workers (Wrangler), Drizzle ORM, PostgreSQL. Koneksi lewat Hyperdrive + `pg` (lihat DECISIONS.md).
- `packages/shared`: skema Drizzle, tipe, skema zod, helper (`formatRupiahRingkas`, `hitungStatusBukti`). Satu-satunya tempat aturan format uang dan aturan status bukti.
- `data/`: CSV sumber impor (`program.csv`, `bidang_urusan.csv`). Bukan tempat data hidup.
- `scripts/`: seed dan ekstraksi. `docs/`: dokumentasi.

## Perintah

Package manager: bun. Nama skrip root: `typecheck`, `lint`, `test`, `dev`, `db:migrate`, `db:seed` (periksa `package.json` bila berbeda). Urutan lokal: `docker compose up -d`, `bun install`, `bun run db:migrate`, `bun run db:seed`, `bun run dev`. Postgres lokal memakai port host 5433 (bisa diatur lewat `.env`). Salin `.env.example` ke `.env`; jangan commit `.env`.

Sebelum menyatakan pekerjaan selesai: jalankan `typecheck`, `lint`, dan `test`. Laporkan jujur apa yang dijalankan dan apa yang tidak.

## Konvensi

- TypeScript strict. Validasi respons API dengan zod di `packages/shared`.
- Aturan status bukti dihitung di satu tempat (`hitungStatusBukti`): "ada" hanya bila evidence punya `source_document_id`.
- Status bukti dihitung dari tabel `evidence`, tidak disimpan sebagai kolom.
- Jangan menebak versi library; pasang versi stabil terbaru lewat bun dan biarkan lockfile mencatatnya. Untuk Workers, Drizzle, dan Next.js, baca dokumentasi resmi terbaru sebelum memilih pola.
- Seed harus idempoten dan gagal dengan pesan jelas bila CSV tidak ada. Jangan membuat data tiruan di `data/` atau di DB dev.
- Komponen UI bersama (Header, Footer, Kartu Program, Lencana Status, Angka Uang dengan tooltip, Bagan Batang, Kotak Sumber) dipakai ulang; token warna dan tipografi di satu tempat agar desainer bisa mengganti tampilan.
- Aksesibilitas dasar: heading berurutan, fokus terlihat, kontras cukup, label form, tooltip dapat diakses keyboard.

## Git

Jangan commit, push, atau deploy kecuali diminta. Pesan commit ringkas dan deskriptif.

## Masih terbuka (jangan diputuskan sendiri)

Host PostgreSQL produksi, hosting web, nama produk, kontak koreksi, dan peninjauan hukum teks PPID. Bila pekerjaan menyentuh hal ini, tulis asumsi di `docs/DECISIONS.md` dan tanyakan.
