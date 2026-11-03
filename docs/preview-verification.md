# Lanjutan preview — 3 November 2026

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
deployment. Deployment web menunggu artifact dan dicatat setelah berhasil.

## Batas

Lokasi nyata pada perangkat fisik dan penerimaan email masih memerlukan uji
pengguna. Alur persetujuan, konfirmasi, serta respons lokasi tiruan sudah diuji;
tidak ada koordinat pribadi dibaca dalam pengujian otomatis. Persetujuan hukum
final tim dan hari libur kalender belum diselesaikan. Penanda TODO-REVIEW serta
penjelasan bahwa Pelacak hanya menghitung perkiraan tetap ditampilkan.
