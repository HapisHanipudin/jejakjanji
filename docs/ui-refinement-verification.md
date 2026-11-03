# Refinement UI/UX — 3 November 2026

Commit aplikasi `ad2a089` pada `feat/multi-daerah-local`. Identitas visual Hi-Fi
(Plus Jakarta Sans, palet navy-krem, komponen yang sama) dipertahankan. Tidak ada
perubahan API, database, migrasi, data, main, atau Worker development lama.

## Audit sebelum perubahan

Sumber audit: screenshot preview publik pada 1440, 1280, 390, dan 375 px;
GDocs "JejakJanji v1.0 — Dokumen Produk" (tab induk, PRD, System & Data
Engineering, Design & Prototype, GTM/Etika/Risiko) yang baru diperbarui
pengguna; Figma page 117:404 (masih page terbaru; landing 130:509 dan 130:560,
Beranda daerah 117:468). Kode sudah mengikuti 117:404 hampir 1:1.

Lima masalah dengan dampak terbesar, sesuai urutan pengerjaan:

1. Beranda daerah tidak punya pencarian. PRD BR-1 (P0) dan GTM ("contoh kata
   kunci di bawah kotak pencarian") memintanya; pengguna harus membuka Daftar dulu.
2. Langkah setelah "Belum diketahui" kurang jelas. Tombol PPID di Detail tidak
   membawa tahap bukti (PRD DT-5, P0). Komponen "Langkah PPID" bernomor di tab
   Design & Prototype belum ada.
3. Filter Daftar tidak menunjukkan apa yang sedang aktif dan tidak bisa dihapus
   satu per satu; empty state tidak memberi jalan keluar (PRD DF-4). Kolom tengah
   kosong lebar pada desktop.
4. Landing menaruh satu-satunya daerah aktif di bawah lipatan, sementara sisi
   kanan hero kosong.
5. Target sentuh nav ponsel 39 px; daftar cek aksesibilitas di dokumen meminta
   44 px.

## Perubahan

- Beranda daerah: kotak cari (GET ke Daftar, tetap bekerja tanpa JavaScript) dan
  tiga contoh kata kunci yang diambil dari nama program terpendek daerah itu,
  bukan teks rekaan. Kartu "Daerah lain" dari Figma 117:468 ditambahkan; daftar
  daerah aktif dibaca dari API, tanpa angka pagu atau status antar daerah.
  Bagan enam bidang (kode 1/2/3), persen satu desimal, tooltip, dan pola tautan
  `?bidang=` tidak berubah.
- Landing: kartu "Data yang tersedia saat ini" pindah ke hero. Jumlah program
  dikurasi dibaca per daerah dari API dan tidak dijumlahkan lintas daerah.
- Daftar: chip filter aktif yang bisa dihapus satu per satu dan "Hapus semua"
  (tautan biasa, URL tetap sumber kebenaran); empty state menautkan semua program;
  kolom program, pagu, dan jejak bukti diseimbangkan ulang.
- Detail: setiap tahap Anggaran atau Pelaksanaan yang belum diketahui punya
  tautan "Minta bukti tahap ini" ke Draf PPID dengan `?minta=anggaran` atau
  `?minta=pelaksanaan`. Tahap Rencana tidak diberi tautan.
- Draf PPID: lima langkah bernomor sebelum mengirim (kanal PPID resmi dan Pelacak
  ditautkan). Pilihan informasi terisi sesuai tahap; nilai `minta` lain kembali ke
  pilihan bawaan. Isi surat dan teks hukum tidak berubah.
- Ponsel: tautan nav dan chip minimal 44 px.

Motion tidak ditambah selain transisi warna hover/fokus chip yang sudah mengikuti
aturan reduced motion global. Tidak ada foto, video, atau gerakan acak.

## Pengujian

- Typecheck dan lint lulus. Vitest 41/41 lulus, termasuk 3 tes integrasi
  PostgreSQL pada cluster lokal sekali pakai (PostgreSQL 17, `127.0.0.1`,
  database `jejakjanji_test`) yang dihentikan setelah tes. Satu tes baru untuk
  pemetaan tahap ke pilihan PPID.
- Build Next produksi lulus. Build OpenNext Linux lulus di GitHub Actions
  ([run 41609098697](https://github.com/HapisHanipudin/jejakjanji/actions/runs/41609098697)).
  Artifact divalidasi dengan `wrangler deploy --dry-run`, lalu diterbitkan ke
  Worker preview versi `e1103890-218c-43d8-84bf-837b2b002587`.
- 48 pemeriksaan browser Chrome lulus, pertama pada `next start` lokal dan
  diulang pada https://jejakjanji-web-preview.hapishanipudin.workers.dev/:
  kartu cakupan di atas lipatan; skip link; cari dari Beranda; contoh kata kunci
  memberi hasil; enam batang dengan pola tautan bidang; tooltip nominal penuh
  saat fokus; label pagu; chip filter, hapus satu, hapus semua, empty state;
  Back/Forward mengembalikan isian; filter client; tautan tahap ke PPID dan
  centang yang sesuai; nilai `minta` tak dikenal; salin dan unduh PPID; tautan
  Pelacak; cari dan filter tanpa JavaScript; tanpa overflow pada 375/390 untuk
  tujuh halaman; target nav dan chip 44 px; pembuka landing mati saat reduced
  motion dan aktif saat tidak; tanpa error halaman.
- Screenshot sebelum dan sesudah pada 1440, 1280, 390, dan 375 px diperiksa
  visual. Dua cacat yang ditemukan saat itu sudah diperbaiki sebelum commit:
  langkah PPID 4–5 terpecah menjadi kolom, dan catatan tahap tertimpa legend.
  Screenshot disimpan di folder kerja lokal, bukan di repo.

## Selisih GDocs dan kode

GDocs tidak diubah. Selisih yang ditemukan:

- PRD PL-1 dan tab System & Data "Alur pelacak" masih menyebut localStorage
  `{versi: 1}`. Kode memakai versi 2 dengan migrasi dan impor v1 (bagian
  "Perubahan web" di tab yang sama sudah menyebut versi 2).
- Tab Design & Prototype menyebut pemilih daerah "Dropdown dengan pencarian di
  Nav desktop". Kode dan Figma 118:415 memakai dialog modal dengan pencarian;
  mobile memakai bottom sheet.
- Tab Design & Prototype menyebut Footer memuat tautan Metodologi. Footer kode
  memuat kontak koreksi dan label pagu, belum tautan Metodologi (Metodologi ada
  di Nav).
- Daftar cek aksesibilitas meminta bagan pagu punya tabel atau teks alternatif.
  Bagan memakai teks nilai per batang dan caption tersembunyi, bukan tabel.
- PRD BR-1 (cari di Beranda) dan DT-5 (tombol PPID membawa tahap) sebelumnya
  belum ada di kode; keduanya diterapkan di commit ini.
- PRD DT-2 meminta tahun tanpa pagu tertulis "Belum diketahui". Data Jakarta
  saat ini lengkap untuk 2026–2030, jadi tampilan tahun kosong belum teruji.

## Lanjutan: motion penjelas dan scroll

Commit `93de522` dan `24f243d`, diterbitkan ke Worker preview versi
`7f856b6d-9e83-436f-bb1b-fd09fdbb07f8` setelah build Linux lulus
([run 41613341921](https://github.com/HapisHanipudin/jejakjanji/actions/runs/41613341921))
dan dry run Wrangler.

- Detail: jejak bukti Rencana, Anggaran, Bukti tergambar berurutan.
- Beranda daerah: meter cakupan "10 dari 82" (angka dan sumber yang sama) terisi
  sekali; berlabel untuk pembaca layar.
- Daftar: baris hasil masuk berurutan setelah filter.
- PPID: baris surat yang baru dicentang disorot sesaat; tombol salin berubah
  menjadi "Tersalin ✓" selama dua detik. Isi surat dan clipboard tidak berubah.
- Pelacak: baris yang baru disimpan disorot sesaat; chip filter muncul halus.
- Scroll: bagan bidang, pagu per tahun, kartu "Dari rencana sampai bukti",
  langkah landing, dan "Daerah lain" diputar sekali saat pertama kali masuk
  layar. Blok yang sudah terlihat saat halaman dibuka tidak dianimasikan.

Animasi scroll memakai IntersectionObserver kecil. Elemen utuh secara bawaan;
JavaScript hanya memicu animasi sekali. CSS scroll timeline sempat dicoba lalu
dibatalkan karena screenshot full-page membekukan batang pada panjang parsial,
yang menyesatkan untuk data. Semua animasi hilang saat reduced motion.

Pemeriksaan pada build lokal dan preview HTTPS: 22 cek scroll (batang utuh
sebelum digulir dan tanpa JavaScript, diputar sekali saat masuk layar pada 390
px, tidak diputar saat sudah terlihat, proporsi batang sama dengan data, kartu
akhir penuh, navigasi client, reduced motion), 44 cek motion (dengan dan tanpa
reduced motion), dan 48 cek regresi lulus. Typecheck, lint, 38 tes unit lulus;
3 tes integrasi PostgreSQL lulus pada cluster lokal sebelum commit `93de522`
(API tidak berubah setelahnya).

## Batas

Uji di atas adalah uji teknis browser, bukan wawancara atau uji tugas lima
pengguna. Safari/iOS dan Firefox tidak diuji dalam sesi ini; ponsel diuji dengan
emulasi viewport Chrome. Audit aksesibilitas penuh dan pembaca layar belum
dilakukan. Lokasi tidak diuji ulang dan tidak ada koordinat yang dibaca; pemetaan
wilayah tetap hanya ID-JK. Teks hukum masih menunggu tinjauan tim dan hari libur
belum masuk perhitungan tenggat. Figma tidak diubah.
