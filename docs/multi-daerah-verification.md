# Multi-daerah / Jakarta-first — 3 November 2026

Catatan tahap lokal awal pada branch `feat/multi-daerah-local`, dari `da01f63`.
Pada tahap awal belum ada commit, push, deploy, atau migrasi database remote.
Status lanjutan setelah izin pengguna ada di [preview-verification.md](preview-verification.md).
Versi Figma acuan: page 117:404,
landing desktop 130:509 dan mobile 130:560, file `Lq7xYDmjODYgZpJ7jE6F3Z`.

## Perilaku

- `/` landing umum. Daerah aktif seed hanya DKI Jakarta (`31`, `dki-jakarta`).
- Enam halaman berada di bawah `/[daerah]`. URL menentukan konteks; pilihan
  tersimpan hanya pintasan pada landing, tidak menimpa deep link.
- Pilihan daerah berupa dialog desktop dan bottom sheet mobile. Tidak ada
  daftar wilayah rekaan, leaderboard, atau agregasi pagu lintas daerah.
- Daerah dikenal tetapi `BELUM_DIKURASI` menampilkan penjelasan, Metodologi,
  dan kembali ke Jakarta. Daerah tidak dikenal mendapat 404.
- Lokasi opsional: penjelasan pihak ketiga, persetujuan, izin browser,
  saran, lalu konfirmasi pengguna. Tidak ada perpindahan otomatis.
- Modal, bagan, dan hover memakai animasi CSS ringan. `prefers-reduced-motion`
  menonaktifkannya. Tidak ada splash screen atau dark mode.
- Pelacak versi 1 dimigrasikan ke versi 2, menambahkan identitas Jakarta.
  Data sebelumnya dicadangkan sebelum penulisan. Impor berlaku seluruh daerah;
  konfirmasi dan berkas cadangan dibuat sebelum penggantian. Data rusak dan
  kegagalan penyimpanan tidak mengganti data lama.

## Lokasi dan privasi

BigDataCloud dipanggil langsung dari browser setelah persetujuan. Penyedia
menerima koordinat perangkat dan IP; disclosure menjelaskan pemakaian untuk
saran lokasi dan peningkatan layanan mereka. JejakJanji tidak mengirim koordinat
ke API sendiri atau menyimpannya. Tidak memakai fallback lokasi IP.

Pemetaan eksplisit hanya ISO `ID-JK` ke Kemendagri `31`. Ini belum deteksi
seluruh Indonesia. Hasil lain, penolakan izin, timeout, dan kegagalan layanan
menyediakan pilihan manual. Tambahkan pemetaan terverifikasi bersama kurasi
daerah baru, bukan menebak kode dari nama.

Dokumentasi penyedia:
https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api

## Database dan kompatibilitas

Migrasi baru `0001_wild_wendell_vaughn.sql` menambahkan daerah dan mengisi
`daerah_kode=31` untuk seluruh data lama. Migrasi 0000 tidak diubah.
PK program/bidang menjadi `(daerah_kode,kode)`. Foreign key dokumen, bidang,
program, funding, dan evidence menyertakan daerah untuk menolak rujukan silang.
Nilai default 31 dipertahankan selama masa kompatibilitas penulis lama.

Uji PostgreSQL 17 lokal: migrasikan schema lama, jalankan seed lama, simpan
seluruh baris, terapkan 0001, lalu bandingkan setiap sel lama. Hasil sama:
2 dokumen, 44 bidang, 10 program, 50 pagu, dan 10 evidence. Seed baru berhasil
tanpa evidence tambahan. Nilai CSV lama juga dipertahankan; hanya kolom
`daerah_kode` ditambahkan. Seed menolak selain `31`.

API daftar menerima kode atau slug melalui `?daerah=`. Default endpoint lama
tetap Jakarta; `/api/program/:kode` selalu detail Jakarta. Endpoint detail baru
`/api/daerah/:daerah/program/:kode`. Respons memuat metadata daerah; daerah
belum dikurasi menghasilkan `data: []` atau `data: null` untuk detail.

Urutan rollout saat nanti diizinkan: cadangan database, migrasi 0001 secara
atomik, API baru, lalu web baru. Jangan jalankan web baru dengan API lama.
Gunakan seed baru setelah 0001; seed lama masih menargetkan constraint satu
daerah dan tidak kompatibel dengan kunci gabungan.
Sebelum seed daerah pilot, audit dokumen, kode wilayah, pemetaan lokasi,
metadata PPID, dan seluruh referensi daerah. Seed saat ini sengaja Jakarta saja.

Rollback manual: `docs/sql/rollback-multi-daerah.sql`. Hentikan aplikasi baru
dan buat cadangan dahulu. Skrip menolak metadata daerah tambahan/berubah,
data non-Jakarta, atau migrasi yang lebih baru. Skrip mengembalikan constraint
lama dan menghapus hanya catatan migrasi 0001 dari journal bila tersedia.
Uji rollback lokal mempertahankan seluruh sel lama; fixture daerah tambahan
memblokir rollback. Kedua uji dibatalkan transaksinya agar DB kerja tetap baru.
Setelah ada kurasi daerah kedua, gunakan migrasi balik khusus yang menjaga data,
bukan memaksa skrip ini.

## Pemeriksaan

Perintah akhir: `bun run typecheck`, `bun run lint`,
`bun --env-file=.env node_modules/vitest/vitest.mjs run`, dan
`bun run --cwd apps/web build`. Produksi lokal dijalankan lewat
`bun run --cwd apps/web start --port 3099`, `API_BASE_URL=http://127.0.0.1:8799`.
PostgreSQL lokal hanya mendengarkan `127.0.0.1:55439`.

File utama: `packages/shared/src/schema.ts` dan `api.ts`, migrasi 0001 beserta
snapshot/journal, `scripts/seed.ts`, kedua CSV, `apps/api/src/index.ts` dan tes
integrasinya; web `app/[daerah]/`, landing, layout, redirects, `RegionPicker`,
`RegionEmpty`, navigasi, `PpidDraft`, `RequestTracker`, serta helper data,
lokasi, preferensi daerah, dan penyimpanan Pelacak. Dokumentasi README,
data README, DECISIONS, dan first-draft verification diperbarui.

- Typecheck seluruh workspace, ESLint/Prettier, dan build Next produksi lulus.
- 36 tes unit lulus; 3 tes integrasi PostgreSQL lulus. Integrasi menjalankan
  migrasi Drizzle pada DB tes terpisah, kode program sama pada dua fixture,
  pagu/detail terisolasi, FK silang ditolak, legacy Jakarta, 404, dan empty state.
- Perintah biasa `bun run test` melewati integrasi jika `TEST_DATABASE_URL`
  tidak tersedia. Untuk menyertakannya: sediakan DB terpisah kosong di
  `127.0.0.1`, nama berakhiran `_test`, lalu jalankan
  `bun --env-file=.env node_modules/vitest/vitest.mjs run`.
- Browser Chrome pada Next `build` + `start`, API lokal dengan PostgreSQL.
  API diuji melalui Hono dengan koneksi lokal yang diinjeksi; runtime Worker/
  Hyperdrive tidak dijalankan dalam sesi ini.
- Landing dan enam halaman regional diperiksa pada 390 dan 375 px: tidak ada
  luapan horizontal atau badge dev. Enam batang Jakarta tidak memuat Keuangan;
  bidang keenam 1.05, Rp2.978.345.596.653. Semua batang bertaut ke daftar terfilter.
- Redirect `/program?q=2.11` mempertahankan query. Dialog dapat ditutup dengan
  Escape. Reduced motion menonaktifkan animasi bagan.
- HTTP diperiksa langsung: slug tidak dikenal dan kode program tidak dikenal
  menghasilkan 404; redirect lama menghasilkan 308 beserta query.
- Enam rute daerah belum dikurasi diperiksa di browser desktop dan mobile
  memakai fixture berlabel contoh pada DB tes terpisah. Fixture dibersihkan;
  seed dan DB kerja tetap hanya Jakarta.
- Geolocation dan respons penyedia ditiru dalam browser terisolasi. Tidak ada
  pembacaan lokasi pribadi atau request BigDataCloud nyata. Diuji bahwa koordinat
  tidak diminta sebelum persetujuan, dan hasil tidak memindahkan URL sendiri.
- Clipboard PPID nyata berhasil. Blob unduhan TXT cocok dengan clipboard
  setelah normalisasi CRLF Windows. Ekspor JSON, migrasi v1, impor v1 dengan
  cadangan, dan penolakan impor rusak berhasil di browser. Browser membatalkan
  unduhan ke disk; keberhasilan penyimpanan berkas belum terverifikasi.

## Sisa

Kontak koreksi masih `[kontak koreksi]`; bukan screenshot submission final.
URL PPID daerah belum diverifikasi dan tetap null; antarmuka menjelaskan ini.
Teks hukum tetap TODO-REVIEW, hari libur belum diperhitungkan. Provider lokasi
nyata, izin pada perangkat fisik, Worker/OpenNext, deployment, serta uji pengguna
belum diperiksa. Tidak ada kontak, wilayah pilot, dokumen, atau angka baru rekaan.
