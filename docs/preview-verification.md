# Lanjutan preview — 3 November 2026

Laporan gagal lokasi dari pengguna dan koreksi kontrak respons penyedia dicatat
di [location-verification.md](location-verification.md). Tes mock lokasi awal
memakai enum yang salah; catatan sukses alur mock di bawah bukan bukti bahwa
lokasi perangkat nyata sudah berhasil.

Pembaruan motion dicatat di [motion-verification.md](motion-verification.md).
Refinement UI/UX berikutnya beserta versi Worker terbaru dicatat di
[ui-refinement-verification.md](ui-refinement-verification.md). Bagian deployment di bawah
mencatat versi saat verifikasi multi-daerah awal.

Pengguna mengizinkan commit, push, dan deploy preview, lalu secara eksplisit
menyetujui migrasi database development Neon yang dipakai Hyperdrive
`jejakjanji-db`. Branch kerja `feat/multi-daerah-local`; main tidak diubah.

## Sudah dijalankan

- Kontak koreksi dari pengguna: `support@jejakjanji.id`, ditampilkan sebagai
  tautan email di Footer, Metodologi, dan ajakan kurasi. Tidak ada email dikirim;
  penerimaan email belum diuji.
- Kanal PPID Jakarta diverifikasi dari FAQ dan formulir resmi. Seed mengisi
  `ppid_url` yang kosong tanpa menimpa kanal yang sudah dikurasi. Rujukan dan
  batas tinjauan hukum dicatat di [ppid-review.md](ppid-review.md).
- Unduhan TXT PPID, ekspor JSON, dan cadangan sebelum impor berhasil disimpan
  dan dibaca dari disk pada Chrome Windows. Penyebab kegagalan tes sebelumnya
  adalah `downloadPath` alat uji yang memakai slash non-native. Tidak perlu
  mengubah helper unduhan produk. Isi TXT cocok dengan clipboard setelah
  normalisasi newline; JSON cocok dengan data Pelacak. Impor rusak tetap
  mempertahankan data lama.
- API dijalankan dengan `wrangler dev --local` dan binding Hyperdrive lokal.
  Enam endpoint diperiksa: daftar daerah, program, bidang, sumber, detail,
  dan daerah invalid. Hasil 200/404 sesuai. Koneksi PostgreSQL lokal perlu
  bagian password meskipun cluster uji memakai trust authentication.

## Migrasi development remote

Target yang dikonfirmasi: database `neondb`, host
`ep-blue-queen-ao572ka5.c-2.ap-southeast-1.aws.neon.tech`.

Migrasi berhenti pada percobaan awal karena pg_dump 17 tidak cocok dengan
server Neon 18. Tidak ada DDL remote dijalankan pada percobaan tersebut.
Kemudian dibuat cadangan SQL/JSON konsisten atas schema/data aplikasi dan
journal Drizzle. Cadangan dipulihkan pada database lokal baru; setiap sel
dibandingkan sebelum DDL remote dijalankan.

Migrasi 0001 diterapkan dalam satu transaksi, beserta catatan hash migrasinya.
Semua nilai lama sama: 2 dokumen, 44 bidang, 10 program, 50 funding, 10 evidence.
Role runtime `jejakjanji_reader` diberi SELECT pada tabel daerah baru.
Seed baru berhasil, tanpa evidence tambahan. Hanya metadata PPID Jakarta baru
yang diisi. Tidak ada data pilot atau fixture masuk database remote.

Cadangan berada di folder output lokal `database-backup-2026-11-03`, di luar
repo. Tidak mengandung password koneksi. Cadangan itu mencakup tabel aplikasi
dan journal migrasi; bukan salinan konfigurasi akun Neon/Cloudflare.
Rollback generik sengaja menolak metadata PPID yang sudah berubah dari null;
jangan memaksa rollback setelah seed kanal. Gunakan cadangan dan tinjau migrasi
balik yang mempertahankan metadata tersebut.

## Deployment dan build

API preview terpisah:
https://jejakjanji-api-preview.hapishanipudin.workers.dev

Versi API: `6c39a6f5-c83a-42e2-b468-bd5b1f165b36`. Endpoint regional 200;
daerah invalid 404. API development lama masih memberi 200 dan 10 program.
Preview memakai Hyperdrive development yang telah disetujui, melalui role
baca-saja. Worker lama tidak diganti.

Build Next produksi lulus. Bundling OpenNext Windows gagal membaca symbolic
link dependensi, termasuk setelah pemeriksaan izin. WSL menyiapkan runtime
Linux tetapi kemudian mengalami HCS connection timeout saat memulai build.
Build bundle dipindahkan ke GitHub Actions Linux melalui workflow
`preview-build.yml`. Workflow hanya menghasilkan artifact tanpa secret
deployment. Build Linux untuk commit `52a46c6` lulus:
https://github.com/HapisHanipudin/jejakjanji/actions/runs/41594607386.

Web preview:
https://jejakjanji-web-preview.hapishanipudin.workers.dev/

Versi web saat verifikasi awal: `6a22ee5f-c8e1-4d03-83ae-dbe9e2120246`. Bundle Linux
divalidasi dengan Wrangler lalu diterbitkan ke Worker preview terpisah.
Commit awal implementasi `9e29736`, pembetulan mobile `52a46c6`, keduanya
dipush ke branch tersebut. Main dan Worker development lama tidak diganti.

## Verifikasi publik

- Landing umum dan enam halaman Jakarta diperiksa di browser pada desktop
  1280, mobile 390 dan 375 px. Data asli tampil, tanpa badge dev atau error
  browser tak tertangani. Kontak koreksi bukan placeholder lagi.
- Bagan tetap enam bidang yang benar; tautan PPID resmi tampil. Pemilih
  daerah dan halaman persetujuan lokasi diperiksa tanpa meminta GPS pribadi.
- Pemeriksaan visual menemukan tabel sumber Metodologi sempit dan tanggal
  terpotong di mobile. Tabel diubah menjadi kartu per sumber pada ponsel.
  Tautan PPID diberi paragraf terpisah agar tidak menyatu dengan tautan Pelacak.
- Clipboard nyata, unduhan TXT, ekspor JSON, impor v1 dengan unduhan cadangan,
  dan penolakan impor rusak lulus pada domain HTTPS preview. Berkas benar-benar
  tersimpan di disk, bukan hanya Blob yang ditiru.
- HTTP 200/404/308, query pencarian/filter pada redirect, dan CORS origin
  preview diperiksa. Web development lama tetap 200 tanpa pesan error API.
- Seed remote dibandingkan lagi dengan cadangan: semua sel lama tetap sama.
  Daerah hanya Jakarta; role reader memiliki SELECT dan tidak punya
  INSERT/UPDATE/DELETE pada seluruh tabel aplikasi.
- Typecheck dan lint lulus. 39 tes lulus, termasuk 3 integrasi PostgreSQL lokal.
  Build OpenNext Linux lulus sebelum deployment; tes integrasi tidak diklaim
  berjalan di GitHub Actions karena workflow hanya membangun bundle web.

## Batas

Lokasi nyata pada perangkat fisik dan penerimaan email masih memerlukan uji
pengguna. Alur persetujuan, konfirmasi, serta respons lokasi tiruan sudah diuji;
tidak ada koordinat pribadi dibaca dalam pengujian otomatis. Persetujuan hukum
final tim dan hari libur kalender belum diselesaikan. Penanda TODO-REVIEW serta
penjelasan bahwa Pelacak hanya menghitung perkiraan tetap ditampilkan.

## Migrasi 0002 (`ppid_email`) — 8 November 2026

Pengguna menyetujui migrasi 0002 di Neon development yang sama (`neondb`,
`ep-blue-queen-ao572ka5`). Migrasi hanya menambah kolom `daerah.ppid_email`
(nullable). Tidak ada cadangan penuh baru; jumlah baris dicatat sebelum dan
sesudah dan tetap sama: 1 daerah, 2 dokumen, 44 bidang, 10 program,
50 funding, 10 evidence. Journal Drizzle bertambah satu baris (id 3).

Jakarta diisi `ppid@jakarta.go.id` lewat `UPDATE ... coalesce`, setara dengan
seed, tanpa menjalankan ulang seed penuh. Role baca-saja memakai hak SELECT
tingkat tabel, jadi kolom baru ikut terbaca.

Setelah migrasi: `/api/daerah` dan `/api/program` memberi 200 pada API
produksi, API `-preview`, dan API preview branch PR #12; hanya API branch yang
mengembalikan `ppidEmail`. Web preview branch masih membaca API produksi
(`API_BASE_URL` di `apps/web/wrangler.toml`), jadi penerima email baru terisi
di web setelah API dengan kode baru di-deploy. Rollback: `ALTER TABLE daerah
DROP COLUMN ppid_email` dan hapus baris journal id 3, setelah API lama aktif.
