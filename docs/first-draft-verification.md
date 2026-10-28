# Verifikasi first draft — 28 Oktober 2026

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
