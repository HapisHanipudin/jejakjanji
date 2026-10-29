# Deployment Cloudflare Workers dan Neon

Web: Next.js melalui OpenNext di Worker `jejakjanji-web`. API: Hono di Worker
`jejakjanji-api`. API mengakses PostgreSQL Neon melalui Hyperdrive. Tidak ada
kredensial database di web atau repository.

## Jalur utama: koneksi GitHub di Cloudflare

Pengguna memilih Workers Builds yang terhubung ke GitHub, bukan deploy web dari
komputer lokal. Konfigurasi di bawah harus sudah tersedia pada branch repo yang
dihubungkan. Repo: `HapisHanipudin/jejakjanji`. Gunakan akun `hapishanipudin`.

Hubungkan repo yang sama ke dua Worker dengan pengaturan berbeda:

| Pengaturan      | Web                                           | API                                           |
| --------------- | --------------------------------------------- | --------------------------------------------- |
| Nama Worker     | `jejakjanji-web`                              | `jejakjanji-api` (sudah ada)                  |
| Branch produksi | `main` setelah perubahan konfigurasi digabung | `main` setelah perubahan konfigurasi digabung |
| Root directory  | `apps/web`                                    | `apps/api`                                    |
| Build command   | `bun run build:cloudflare`                    | Kosong; Wrangler membundel API saat deploy    |
| Deploy command  | `bun run deploy`                              | `bun run deploy`                              |

Untuk API yang sudah ada: buka Worker → Settings → Builds → hubungkan GitHub.
Untuk web baru: Workers & Pages → Create → hubungkan GitHub → pilih repo, lalu
isi nama dan root directory sesuai tabel. Nama di dashboard harus sama dengan
`name` pada konfigurasi Wrangler. Pilih Workers untuk web yang dirender server.

Set build variable `NODE_VERSION=24.15.0` dan `BUN_VERSION=1.4.4` pada kedua
Worker. Dependensi workspace harus dipasang dari lockfile root (`bun install
--frozen-lockfile`); Cloudflare memasang dependensi sebelum build. Bila deteksi
otomatis tidak memilih bun untuk monorepo, gunakan pengaturan instalasi/build
yang menjalankan perintah tersebut dari root repo, lalu skrip app terkait.

`API_BASE_URL` web dan `CORS_ORIGINS` API sudah ada di `[vars]` konfigurasi Wrangler.
Hyperdrive API sudah menunjuk ke Neon. Tidak perlu memasukkan `DATABASE_URL`,
password Neon, atau `NEON_AUTH_BASE_URL` sebagai build variable web. Migrasi/seed
awal sudah dijalankan; jangan menambahkannya ke build command.

Setelah koneksi disimpan, push ke branch produksi memicu build dan deploy di
Cloudflare. Koneksi GitHub dan build pertamanya belum diverifikasi pada sesi ini.
Langkah CLI di bagian berikut merupakan catatan persiapan/manual, bukan jalur
deployment web pilihan pengguna.

## 1. Akun dan database

Login dengan `bun run --cwd apps/api wrangler login`. Bila ada beberapa akun,
isi `CLOUDFLARE_ACCOUNT_ID` pada environment terminal sesuai akun pilihan tim.
Gunakan akun yang sama untuk kedua Worker dan Hyperdrive.

Pilih project, branch, dan database Neon khusus untuk aplikasi ini. Periksa target
sebelum migrasi atau seed; jangan gunakan database aplikasi lain. Simpan connection
string **direct/non-pooled** dengan TLS pada `.env.neon` di root sebagai
`DATABASE_URL=...`. Berkas ini diabaikan Git. Jangan masukkan kredensial ke chat,
repo, atau screenshot.

## 2. Migrasi dan data awal

Jalankan dari root setelah memeriksa target Neon:

```sh
bun --env-file=.env.neon run db:migrate
bun --env-file=.env.neon run db:seed
```

Migrasi menyiapkan tabel; seed mengimpor CSV kurasi. Jangan menjalankan migrasi
atau seed pada setiap request web.

## 3. Hyperdrive dan API

Di dashboard Cloudflare, buat Hyperdrive pada akun pilihan dan hubungkan ke
connection string Neon **tanpa connection pooling**. Untuk API baca-saja, gunakan
role khusus dengan hak `CONNECT`, `USAGE` pada schema `public`, dan `SELECT` pada
tabel. Simpan role migrasi/seed terpisah dari runtime API.

Matikan query caching pada konfigurasi awal agar perubahan data langsung terlihat.
Hyperdrive tetap mengelola pool koneksi. Salin ID Hyperdrive (bukan password) ke
`apps/api/wrangler.toml`, menggantikan ID nol pada binding `HYPERDRIVE`.

```sh
bun run --cwd apps/api deploy
```

Periksa URL deployment melalui `/api/sumber`, `/api/program`, `/api/bidang-urusan`,
dan `/api/program/2.11.11`. Data awal: 2 dokumen, 10 program, 44 entri bidang;
pagu 2026 kode tersebut 1.322.664 juta rupiah.

## 4. Web

```sh
bun run --cwd apps/web build:cloudflare
bun run --cwd apps/web deploy
```

`deploy` web menerbitkan hasil build yang sudah ada. Build ulang setiap kali kode
berubah. Bila build OpenNext gagal pada Windows, gunakan WSL atau Linux CI dan
catat hasilnya.

Pada konfigurasi Wrangler web, **runtime variable** `API_BASE_URL` sudah menunjuk
ke `https://jejakjanji-api.hapishanipudin.workers.dev`. Sesuaikan bila URL berubah.
Jangan gunakan `NEXT_PUBLIC_` atau URL localhost. `keep_vars` mempertahankan
variabel dashboard saat deployment berikutnya. Workers Builds memiliki variabel
build dan runtime terpisah; aplikasi ini memerlukan variabel runtime karena data
diambil per request.

Pada konfigurasi Wrangler API, `CORS_ORIGINS` mencakup origin web publik. Deploy API memakai
`--keep-vars`. CORS bukan autentikasi; endpoint saat ini hanya membaca data publik.

Uji enam layar di URL publik, 404 program tidak dikenal, daftar kosong, salin dan
unduh PPID, ekspor/impor Pelacak, serta tampilan ponsel. Penyimpanan Pelacak pada
domain publik terpisah dari localhost; gunakan ekspor/impor untuk memindahkan data.

## Batas kesiapan

Konfigurasi tidak membuktikan deployment berhasil. Laporkan login, build, migrasi,
seed, deployment, dan pemeriksaan URL publik sesuai hasil aktual. Kontak koreksi
dan tinjauan teks hukum PPID masih menjadi pekerjaan produk.

## Hasil sesi 29 Oktober 2026

- Akun Cloudflare: `hapishanipudin`; proyek Neon: `jejakjanji`.
- Koneksi Neon berhasil; schema publik kosong sebelum migrasi. Migrasi dan seed
  berhasil: 2 dokumen, 44 bidang, 10 program, 50 pagu, 10 evidence rencana.
- Role runtime `jejakjanji_reader` dibuat terpisah dari pemilik database. Uji
  membaca jumlah data dan total pagu lulus; percobaan `UPDATE` tanpa baris ditolak
  dengan kode PostgreSQL `42501`.
- Hyperdrive `jejakjanji-db`, ID `b9016926dedf4fe495eb78edd35b8531`, dibuat dengan
  query caching dimatikan. Kredensial role runtime disimpan lokal di
  `.env.hyperdrive`; kredensial migrasi di `.env.neon`. Keduanya diabaikan Git.
- API aktif di <https://jejakjanji-api.hapishanipudin.workers.dev>. Empat endpoint
  baca diuji HTTP 200 dan datanya cocok; 404 kode tidak dikenal serta CORS origin
  web juga diuji. Versi API: `b5162c03-767d-4d90-8072-93433e4fc1e5`.
- Build Next.js di Windows berhasil. Bundling OpenNext gagal pada symbolic link
  dependensi dengan `Access is denied`; build Linux dicoba terpisah. Jangan
  menganggap web sudah terbit berdasarkan keberhasilan API.
- Build OpenNext Linux kemudian berhasil. Deploy web manual dihentikan setelah
  pengguna menegaskan ingin koneksi GitHub di dashboard Cloudflare. Web belum
  dipublikasikan oleh sesi ini; API yang sebelumnya terbit tetap aktif.
- Password pemilik database yang sempat diberikan di chat perlu dirotasi melalui
  Neon dan diperbarui di `.env.neon`. API menggunakan password role pembaca
  berbeda yang tidak dicetak dalam laporan.

## Rujukan

- [Cloudflare OpenNext](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- [OpenNext setup](https://opennext.js.org/cloudflare/get-started)
- [OpenNext environment variables](https://opennext.js.org/cloudflare/howtos/env-vars)
- [Neon melalui Hyperdrive](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/neon/)
- [Hyperdrive query caching](https://developers.cloudflare.com/hyperdrive/concepts/query-caching/)
