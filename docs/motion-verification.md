# Motion dan interaksi — 3 November 2026

Perubahan mempertahankan identitas Hi-Fi, isi, sumber, angka, serta rute daerah.
Tidak ada dependency baru, perubahan API, migrasi database, atau perubahan main.

## Perilaku

- Landing membuka judul dalam 650 ms; teks pendukung dan pilihan daerah dalam
  500 ms. Isi tersedia sejak HTML pertama; tidak ada preloader atau gerbang.
- Hover/fokus menyorot baris bagan. Ketebalan track berubah tanpa mengubah
  panjang batang, nilai, proporsi, atau unit. Seluruh baris bertaut ke bidangnya;
  tooltip angka penuh tetap dapat difokuskan dan tidak memicu navigasi.
- Filter memakai navigasi client setelah JavaScript aktif. Tombol menampilkan
  status memuat selama request sebenarnya; tidak ada waktu tunggu buatan.
  Hasil masuk dalam 240 ms. Posisi scroll dipertahankan sepanjang tinggi dokumen
  masih memungkinkan. URL tetap sumber kebenaran; Back/Forward mengembalikan
  isian sesuai query. Tanpa JavaScript, form tetap GET biasa.
- Reduced motion menonaktifkan pembuka, perpindahan hasil, dan pembesaran track.
  Sorotan, outline fokus, label memuat, dan hasil filter tetap tersedia.
- Tidak ada animasi berulang, scroll hijacking, angka yang dihitung naik, atau
  reveal yang menyembunyikan sumber sampai pengguna menggulir.

## Uji browser produksi lokal

Chrome, Next `build` + `start`, API lokal dengan data Jakarta. Pemeriksaan
mencakup event animasi landing; hover, keyboard, dan klik track bagan; tooltip;
lebar batang sebelum/sesudah interaksi; filter dengan latency 650 ms untuk
memastikan pending/disabled mengikuti request; navigasi tanpa reload; query
Back/Forward dan reset isian; empty state; GET dengan JavaScript dimatikan;
mobile 390/375 px; serta reduced motion. Seluruh pemeriksaan lulus dan tidak
ada error browser tak tertangani.

Typecheck, lint, dan 39 tes termasuk integrasi PostgreSQL lulus. Pemeriksaan
layout dilakukan melalui screenshot dan browser; tidak dibuat tes unit yang
sekadar meniru deklarasi CSS. Review Impeccable mengikuti refinement atas
desain yang sudah ada. Inspeksi Design Taste sebelum/sesudah disimpan sebagai
artifact lokal, tanpa mengganti tipografi atau menambah ilustrasi di luar scope.

Inspektor Design Taste mencatat 0 elemen bergerak sebelum perubahan dan 3
sesudahnya pada landing desktop. Gate generiknya tetap melaporkan 4 FAIL dan
6 WARN: jumlah gambar/video, skala judul, panjang judul mobile, ambang jumlah
gerakan, serta konvensi visual lama. Ini bukan hasil gate desain yang hijau.
Layout, palet, judul, dan anggaran gerak terbatas dipertahankan sesuai scope
refinement; tidak ditambahkan foto, video, atau gerakan acak untuk mengejar skor.

## Preview publik

Commit aplikasi `5387934` dipush pada `feat/multi-daerah-local`.
[Build Linux](https://github.com/HapisHanipudin/jejakjanji/actions/runs/41598292646)
lulus. Bundle diterbitkan ke
https://jejakjanji-web-preview.hapishanipudin.workers.dev/ dengan versi Worker
`7fe38e5a-0624-4811-883c-c1fe282117e0`.

Seluruh skenario browser di atas diulang pada domain HTTPS preview dan lulus,
termasuk pending filter dengan jaringan diperlambat, Back/Forward, GET tanpa
JavaScript, dan reduced motion. Lint sumber Design Taste pada landing mencatat
0 FAIL/0 WARN; itu terpisah dari gate visual yang masih memiliki catatan di atas.
Screenshot dan hasil terstruktur disimpan di folder output lokal `motion/`.
Main, Worker development lama, API, dan database tidak diubah dalam sesi motion.
