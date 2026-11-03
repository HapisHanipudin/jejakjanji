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

Status build Linux dan deployment preview berikutnya dicatat setelah selesai.
