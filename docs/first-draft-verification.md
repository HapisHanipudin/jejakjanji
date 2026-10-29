# Verifikasi first draft — 28 Oktober 2026

## Deployment — 29 Oktober 2026

Pembaruan arahan: pengguna memilih koneksi GitHub di dashboard Cloudflare. Build
OpenNext Linux berhasil; proses deploy web manual dihentikan sebelum publikasi.
Web belum aktif dan keenam halaman publik belum diuji. API yang telah terbit
tetap aktif. Koneksi GitHub dan build pertama Cloudflare belum dikonfigurasi atau
diverifikasi. Tidak ada commit/push konfigurasi lokal pada sesi ini.

Pengguna memilih Cloudflare Workers dan Neon. Akun Cloudflare `hapishanipudin`
berhasil login ulang. Migrasi pada database Neon dengan schema publik kosong
berhasil, kemudian seed menghasilkan 2 dokumen, 44 bidang, 10 program, 50 pagu,
dan 10 evidence rencana. Role baca `jejakjanji_reader` diuji: SELECT berhasil,
UPDATE ditolak (42501). Hyperdrive menggunakan role ini dan query caching dimatikan.

API diterbitkan di https://jejakjanji-api.hapishanipudin.workers.dev. Empat endpoint
baca memberi HTTP 200 dengan jumlah data yang benar; detail 2.11.11 memberi
1.322.664 juta rupiah untuk 2026. Respons 404 dan CORS origin web juga diperiksa.
Rincian konfigurasi dan versi ada di DEPLOYMENT.md. Kredensial hanya di file lokal
yang diabaikan Git; password pemilik database yang diberikan melalui chat perlu
dirotasi oleh pengguna.

Konfigurasi web OpenNext, skrip build/deploy, dan header aset disiapkan. Build
Next.js di Windows berhasil; bundling Workers gagal pada symbolic link dependensi
(Access is denied). Build ulang Linux dilakukan terpisah. Typecheck, lint, dan
29 tes lulus setelah perubahan konfigurasi. Tidak ada commit atau push sesi ini.

## Hasil

- Docker Compose PostgreSQL berhasil dijalankan dan sehat; migrasi berhasil.
- Seed dijalankan dua kali. Sebelum dan sesudah seed kedua: 2 dokumen, 44 bidang, 10 program, 50 pagu, 10 evidence. Kedua eksekusi menambahkan 0 evidence baru karena data sudah ada; tidak ada pertambahan duplikat.
- Baris jumlah tanpa kode dilewati sebelum validasi sumber oleh kode yang sudah ada; tidak diperlukan perubahan parser.
- Assertion terhadap HTTP API lulus: /api/program menghasilkan 10 program; /api/bidang-urusan menghasilkan 44 bidang dan jumlah Rp87.296.545.643.031; detail 2.11.11 memuat pagu 2026 1.322.664 juta, total 7.691.668 juta, halaman PDF 345.
- CSV dibandingkan dengan Sheet sumber pada seluruh 10 program dan 44 bidang. Seluruh pagu, total program, dan halaman cocok. CSV bukan salinan byte-identik: segmen pertama kode menghilangkan nol awal; angka dan persentase memakai format tampilan berbeda; nama bidang 2.17 berbeda kapitalisasi; teks Sumber RKPD di CSV berupa rujukan umum Tabel 5.16–5.23, sedangkan Sheet menyebut tabel spesifik per baris. Teks baris jumlah juga berbeda. CSV tidak diubah dalam sesi ini.
- Sheet program: https://docs.google.com/spreadsheets/d/1E8lwIA58hL_HoqZEGPn9nnbSodJ5_CZZpnjGh6LuRIE/edit (Untitled, A1:Q11).
- Sheet bidang: https://docs.google.com/spreadsheets/d/1KRde1vABrhvzn8DCLKJfhXVfUArZfD7MHmcwmAUpe4w/edit (Untitled, A1:F46).
- Enam layar dibuka di browser: Beranda, Daftar, Detail 2.11.11, PPID, Pelacak, Metodologi. Beranda memuat 82 program prioritas dan 10 dikurasi; daftar memuat 10 kartu; detail cocok dengan angka API.
- PPID: mencentang dokumen laporan menambahkan butir ketiga pada pratinjau. Pelacak: catatan uji lokal bertanggal kirim 28 Oktober menghasilkan perkiraan 11 November 2026 (10 hari kerja), tetap tersimpan setelah muat ulang. Tidak ada permohonan dikirim.
- Metodologi menampilkan tautan RKPD dan kontak koreksi placeholder.
- Typecheck, lint (ESLint dan Prettier), dan 28 tes pada 6 berkas lulus.

## Konfigurasi lokal

.env yang sudah ada menunjuk API_BASE_URL ke port 8788, sedangkan API sesi ini berjalan pada 8787. Web diuji memakai override environment proses API_BASE_URL=http://127.0.0.1:8787. .env tidak diubah. Samakan port sebelum menjalankan ulang secara mandiri.

## Screenshot

Screenshot JPEG full-page dari viewport desktop 1280 × 900 ada di screenshots/data-asli. Ketiganya diperiksa visual sebelum disimpan: data CSV asli, tanpa placeholder pada area tampil, label pagu indikatif terlihat. Screenshot fiktif lama tidak dipakai atau diubah.

## Batas verifikasi

- Hitungan 82 program prioritas, 83 baris Tabel III.28; 173 program perangkat daerah, 212 baris Tabel IV.1 mengikuti hasil audit yang diberikan pengguna. PDF tidak dihitung ulang dalam sesi ini.
- Tidak melakukan build produksi, deploy, uji lintas browser/ponsel, audit aksesibilitas penuh, uji pengguna, atau tinjauan hukum. Kontrol salin/unduh dan ekspor/impor belum diuji melalui browser sesi ini.
- Tidak mengubah Google Doc atau wireframe eksternal.
- Kontak koreksi masih [kontak koreksi], berasal dari apps/web/src/content/site.ts dan tampil di /metodologi bagian Menemukan kekeliruan? (juga /netralitas yang mengarah ke bagian halaman tersebut). Email belum diberikan.
- Tidak membuat PDF proposal, commit, push, atau deploy. Hosting dan ID Hyperdrive produksi tetap terbuka.

## Pemeriksaan lanjutan sebelum screenshot produksi

- CSV dan RKPD PDF 480–483 menunjukkan segmen kode 1/2/3 adalah urusan pemerintahan; 4–8 unsur lain. Permintaan membatasi 1/2 bertentangan dengan cakupan semua urusan. Filter dan screenshot final ditahan sambil menunggu keputusan PM. Rincian ada di DECISIONS.md. Bidang keenam pada kedua cakupan: 1.05, Rp2.978.345.596.653.
- Format proporsi kini memakai helper formatPersen dengan tepat satu desimal dan tanpa spasi sebelum %. Tes meliputi 22,4%; 14,1%; 13,7%; 0,0%; 100,0%.
- HEAD kedua URL RPJMD berhasil 200 application/pdf; GET keduanya berhasil mengunduh PDF 393 halaman. Halaman PDF 2 keduanya mengidentifikasi Perda 2 Tahun 2025, RPJMD 2025–2029; teks halaman 345 identik. Hash berkas berbeda, sehingga bukan berkas byte-identik. Seed dan SOURCES.md kini memakai URL show_file sesuai instruksi pengguna.
- Build produksi berhasil. Typecheck, lint, dan 29 tes lulus sebelum pembaruan URL/dokumentasi terakhir; pemeriksaan akhir dijalankan lagi setelahnya.
- Belum menjalankan start, seed ulang URL, screenshot PNG produksi, uji salin/unduh PPID, ekspor/impor Pelacak, atau uji 375px pada sesi ini. JPEG lama dipertahankan. Metodologi masih berisi kontak placeholder, sehingga belum layak screenshot final.
- Tidak commit, push, atau deploy.

Pemeriksaan akhir setelah perubahan URL: typecheck, lint, dan 29/29 tes lulus. Perbandingan teks seluruh 393 halaman dihentikan karena lama; identitas dokumen didasarkan pada halaman Perda dan sampel halaman 345, bukan audit seluruh isi. PDF unduhan sementara dibersihkan.

## Lanjutan setelah persetujuan PM — 29 Oktober 2026

- PM menyetujui segmen 1/2/3 sesuai PDF. Filter diterapkan sebelum sort dan slice. Assertion terhadap CSV memastikan urutan 1.01, 1.03, 1.02, 2.15, 2.11, 1.05; bidang keenam Rp2.978.345.596.653. Semua batang memiliki tautan daftar terfilter.
- Seed ulang berhasil setelah URL RPJMD diganti: 10 program, 44 bidang, 50 pagu, 0 evidence baru.
- Build dan start produksi dijalankan dengan API_BASE_URL=http://127.0.0.1:8787, sama dengan port API. .env tetap tidak diubah.
- Lima screenshot desktop produksi diperiksa visual dan disimpan sebagai PNG (hasil konversi tangkapan JPEG browser). Beranda, Daftar, Detail bebas overlay dan placeholder; label pagu terlihat. PPID berisi placeholder isian pemohon yang disengaja dan tidak menampilkan pagu. Metodologi tetap [kontak koreksi] dan berkasnya diberi BELUM-FINAL, bukan screenshot final PDF.
- Browser PPID: tombol salin menampilkan Teks surat disalin; clipboard connector terbaca kosong, sehingga isi clipboard belum terverifikasi penuh. Unduh menghasilkan draf-ppid-2.11.11.txt.
- Browser Pelacak: ekspor menghasilkan pelacak-jejakjanji-2026-10-29.json; impor ulang melalui file chooser menampilkan 1 permohonan diimpor. Data uji lokal berasal dari pengujian sebelumnya, tanpa permohonan dikirim ke server.
- Uji 375px: Beranda dan Detail tidak meluap (scrollWidth 375). Daftar awalnya 786px karena select, kemudian 441px karena tooltip tersembunyi. Perbaikan membatasi lebar field/select dan menempatkan tooltip ponsel dalam viewport; hasil verifikasi ulang dicatat berikut.
- Tidak mengisi kontak tanpa email dari PM. Tidak commit, push, atau deploy.

Verifikasi ulang 375px setelah perbaikan: Daftar memiliki scrollWidth 360 dengan innerWidth 375 (ruang scrollbar), tanpa luapan horizontal; select muat dalam form. Beranda dan Detail sebelumnya scrollWidth 375. Semua lima PNG terverifikasi memiliki piksel identik dengan tangkapan yang diperiksa; gambar desktop memiliki area konten 1265px karena scrollbar pada viewport 1280px. Metodologi tetap BELUM-FINAL; PPID mempertahankan isian template.

Pemeriksaan akhir lanjutan: typecheck, lint, dan 29/29 tes lulus; build produksi terakhir berhasil. Server web/API pengujian dihentikan setelah selesai. Tidak commit, push, atau deploy.
