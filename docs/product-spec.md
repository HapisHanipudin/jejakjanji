# JejakJanji: Spesifikasi Produk

Versi 22 Oktober 2026. Ringkasan untuk pengembang, disusun dari Google Doc "MIA WIA 2026 — Product Planning" (tab JejakJanji dan dua subtabnya). Doc tetap jadi tempat perencanaan tim (termasuk tab "PRD JejakJanji" versi 0.1, 22 Oktober 2026, yang isinya diselaraskan ke berkas ini); berkas ini adalah acuan yang ikut di repo. Jika keduanya berbeda, bahas dulu di tim lalu perbarui berkas ini.

Status: **rencana yang disetujui tim untuk dibangun, bukan produk yang sudah divalidasi.** Hal yang masih hipotesis ditandai. Nama produk masih terbuka (JejakJanji, JejakRencana, atau JejakProgram).

## 1. Ringkasan

Situs transparansi yang memudahkan warga memeriksa **program prioritas DKI Jakarta dalam RPJMD 2025-2029**: program mana yang tercantum resmi, berapa pagu indikatifnya, dan bukti apa yang tersedia. Bila bukti belum ada, warga dapat membuat **draf permohonan informasi ke PPID** dan mencatat tenggat jawabannya.

Yang dilacak adalah **program prioritas RPJMD, bukan janji kampanye**. Hubungan program dengan janji tertentu belum dibuktikan dan tidak diklaim.

Konteks lomba: Web In Action, MIA 2026 (UPN Veteran Jakarta). Tema: "Designing Digital Futures, Powering Public Transparency". Bobot penyisihan: fungsi 25, orisinalitas 20, desain 20, konten 20, kesesuaian tema 15.

Tujuan:

- T1: warga menemukan program prioritas RPJMD beserta halaman rujukannya dalam satu tampilan.
- T2: setiap angka pagu tampil dengan satuan, sumber, halaman PDF, tanggal cek, dan label pagu indikatif.
- T3: warga dapat bertindak lewat jalur resmi: draf permohonan PPID dan pelacak tenggat.
- T4 (lomba): first draft 1 November 2026 dan final 11 November, dinilai pada fungsi 25%, orisinalitas 20%, desain 20%, konten 20%, kesesuaian tema 15%.

Bukan tujuan:

- Skor, peringkat, atau penilaian kinerja kepala daerah.
- Menyatakan janji kampanye ditepati atau diingkari, atau menyebut angka sebagai realisasi APBD.
- Akun pengguna, laporan atau bukti dari warga, perbandingan antardaerah, dan halaman admin pada MVP.

Nilai jual yang boleh dipakai:

- Satu kartu program menyatukan rencana, anggaran, dan bukti.
- Setiap angka punya sumber, halaman PDF, dan tanggal cek. Bila bukti kosong, sistem menulis "belum diketahui" dan tidak menuduh program gagal.
- Tanpa skor atau peringkat kepala daerah.
- Pengguna dapat bertindak lewat jalur permohonan informasi resmi.

## 2. Pengguna dan peran

- **Pengunjung** (mahasiswa, jurnalis, warga pemantau): tanpa akun. Membaca, membuat draf permohonan, dan mencatat tenggat di browser. Persona Bagas (mahasiswa politik, menulis evaluasi untuk pers kampus) bersifat ilustratif.
- **Kurator data** (tim): memasukkan dan meninjau program dan bukti lewat skrip impor dari CSV. Tidak ada halaman admin di MVP.
- **Reviewer data**: orang kedua di luar penginput; memeriksa rujukan halaman dan status terhadap PDF asli.
- **Juri dan panitia lomba** (pemangku kepentingan): menilai fungsi, orisinalitas, desain, konten, dan kesesuaian tema; perlu memahami nilai produk dengan cepat.

Kebutuhan dan hambatan pengguna adalah hipotesis sampai wawancara dilakukan.

## 3. Aturan yang tidak boleh dilanggar

1. Setiap angka punya dokumen sumber, halaman PDF, dan tanggal cek.
2. Semua angka belanja berlabel: **"Pagu indikatif, bukan APBD dan bukan realisasi"**.
3. Tanpa skor, peringkat, atau penilaian kinerja kepala daerah.
4. **"Belum diketahui" adalah nilai bawaan** status bukti, bukan penilaian bahwa program gagal. Tampilannya netral (garis putus-putus, bukan merah) dan status tidak boleh dibedakan hanya dengan warna.
5. Tanpa akun, tanpa teks bebas dari pengguna yang dikirim ke server.
6. Situs tidak pernah mengirim permohonan atas nama pengguna. Draf hanya disalin atau diunduh.
7. Angka pendanaan indikatif RPJMD, rencana RKPD, anggaran APBD, realisasi keuangan, dan hasil fisik adalah hal berbeda dan tidak dicampur.
8. Jangan menjumlahkan item anggaran yang pemetaannya ke program meragukan. Label anggaran APBD baru boleh dipublikasikan setelah pemetaannya ditinjau.
9. Jangan klaim "pertama di Indonesia". Jangan menuliskan kutipan hukum atau tenggat PPID di luar berkas yang ditandai TODO-REVIEW.

## 4. Ruang lingkup MVP

**Masuk:** satu daerah (DKI Jakarta), 10 program awal dari 82 program prioritas daerah, enam layar (di bawah), empat endpoint baca, draf PPID di browser, pelacak di browser.

**Di luar MVP:** perbandingan antardaerah, label keterbandingan, laporan warga atau bukti dari warga, agregat hasil permohonan, daerah kedua, halaman admin, notifikasi pengingat (pengingat tenggat hanya teks di halaman), pemetaan program ke item APBD, cetak ringkasan (US-09, P2), prediksi, putusan benar atau salah atas klaim pihak mana pun.

Prioritas (usulan): **P0** harus ada pada first draft 1 November; **P1** ditargetkan pada first draft dan paling lambat ada pada final 11 November; **P2** hanya jika waktu cukup. Urutan pengerjaan: daftar program, status berbukti, lalu tautan anggaran. Perubahan lingkup selama sprint harus menyebut fitur yang digeser.

## 5. User journey

| Langkah | Aksi pengunjung                                    | Layar                     | Hasil                                                                                    |
| ------- | -------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| 1       | Membuka beranda                                    | Beranda                   | Melihat ke mana belanja daerah dialokasikan per bidang urusan (pagu indikatif RKPD 2026) |
| 2       | Memilih bidang                                     | Daftar Program            | Kartu program dengan status bukti, filter bidang                                         |
| 3       | Membuka satu program                               | Detail Program            | Rujukan halaman RPJMD, pagu indikatif 2026 sampai 2030, indikator, status bukti          |
| 4       | Bukti belum ada, menekan "Minta informasi ke PPID" | Draf Permohonan PPID      | Draf teks siap salin berisi kode program dan halaman rujukan                             |
| 5       | Mengirim sendiri, mencatat tanggal kirim           | Pelacak Permohonan        | Tenggat dihitung (perkiraan), data tersimpan di browser                                  |
| 6       | Ingin tahu batas klaim                             | Metodologi dan Netralitas | Sumber, tanggal cek, hal yang tidak dilakukan produk                                     |

## 6. Sitemap dan layar

Wireframe low-fi 6 layar (data nyata dari dua Sheet): https://claude.ai/artifact/6HghWBub52Ef1WThza4iSw. Wireframe adalah acuan struktur dan isi; tampilan visual akan dipoles desainer UI/UX.

| Rute                   | Layar                     | Isi pokok                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                    | Beranda                   | Judul dan pengantar; bagan batang belanja per bidang urusan 2026 (enam urusan pemerintahan dengan pagu terbesar; unsur penunjang seperti Keuangan dan Kecamatan tidak ikut; tooltip angka penuh, sumber dan tanggal cek); tiga kartu Rencana, Anggaran, Bukti |
| `/program`             | Daftar Program            | Cari nama atau kode; filter Bidang dan Status bukti (di query string); kartu 3 kolom desktop, 1 kolom ponsel: kode, bidang, nama, pagu 2026, total 2026-2030, lencana status, halaman PDF                                                                     |
| `/program/[kode]`      | Detail Program            | Indikator (kondisi awal, target 2026); tabel pagu 2026-2030 dengan bagan sederhana; sumber dan tanggal cek; kartu Status bukti; tombol ke PPID                                                                                                                |
| `/program/[kode]/ppid` | Draf PPID                 | Pilihan informasi yang diminta; pratinjau surat; salin, unduh, lanjut ke Pelacak. Dibuat sepenuhnya di browser                                                                                                                                                |
| `/pelacak`             | Pelacak                   | Form catat permohonan; tabel permohonan saya dengan status; ekspor dan impor JSON. localStorage                                                                                                                                                               |
| `/metodologi`          | Metodologi dan Netralitas | Dokumen sumber, aturan status bukti, cara membaca pagu, yang dilakukan dan tidak dilakukan, kontak koreksi. `/netralitas` dialihkan ke `/metodologi#netralitas`                                                                                               |

State wajib ada di antarmuka: program tanpa pemetaan anggaran, status "belum diketahui", dokumen sumber tidak dapat dibuka, kode program tidak ditemukan (404 berbahasa Indonesia), daftar kosong, dan error API.

Catatan: spesifikasi lama di tab induk menyebut layar "pilih daerah" dan layar "konteks anggaran per fungsi" terpisah. Untuk MVP satu daerah, yang berlaku adalah sitemap di atas (konteks anggaran ada di Beranda).

## 7. Status bukti

Dihitung dari tabel `evidence`, tidak disimpan sebagai kolom.

| Status                  | Arti                                                                                       | Syarat "ada"                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Tercantum di rencana    | Program ada di RPJMD                                                                       | Bukti jenis RENCANA dengan dokumen dan halaman                     |
| Dianggarkan             | Ada pagu pada dokumen anggaran (RKPD atau APBD)                                            | Bukti jenis ANGGARAN dengan dokumen dan halaman atau baris rujukan |
| Ada laporan pelaksanaan | Ada dokumen capaian yang relevan (mis. LKPJ, laporan kinerja)                              | Bukti jenis PELAKSANAAN dengan dokumen dan halaman                 |
| Belum diketahui         | Bawaan: bukti belum ditemukan dalam cakupan pencarian yang dicatat, lengkap dengan tanggal | Bukan penilaian bahwa program gagal                                |

Aturan implementasi (keputusan saat scaffold): hanya evidence yang punya `source_document_id` yang dihitung "ada". Baris yang hanya berisi `cakupan_pencarian` tetap "belum diketahui". Pagu indikatif RPJMD yang sudah ada belum otomatis berarti "Dianggarkan"; rujukan RKPD atau APBD per program belum ditemukan.

## 8. Data

Sumber:

- **RPJMD DKI Jakarta 2025-2029** (Perda 2 Tahun 2025), 393 halaman PDF. Program prioritas, indikator, pagu indikatif 2026-2030 dalam **juta rupiah**. Tabel III.28 Program Prioritas Daerah (mulai PDF 337) memuat 83 baris untuk 82 program. Tabel IV.1 Program Perangkat Daerah (mulai PDF 351) memuat 212 baris untuk 173 program, termasuk 82 program prioritas tadi. Jumlah baris kedua tabel bukan jumlah program unik. Diperiksa 22 Oktober 2026.
- **RKPD 2026** (Pergub 21 Tahun 2025), 549 halaman PDF. Pagu indikatif **per bidang urusan** dalam **rupiah penuh** (Tabel 5.16 sampai 5.23, PDF 480-483). RKPD memuat pagu per bidang urusan dan per perangkat daerah, **bukan per program**.
- Awal: dua Google Sheet (10 program; pagu per bidang urusan) diekspor ke `data/program.csv` dan `data/bidang_urusan.csv`. CSV hanya sumber impor; data hidup di database.

Skema (lima tabel):

| Tabel             | Kolom                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `source_document` | id, title, type (RPJMD/RKPD), url nullable, version, checked_at                                                                                |
| `bidang_urusan`   | kode (pk), nama, pagu_indikatif_2026 (rupiah), proporsi, source_document_id, page_ref                                                          |
| `program`         | kode (pk), nama, bidang_kode, indikator, satuan, kondisi_awal, target_2026, source_document_id, page_ref, verified                             |
| `funding`         | id, program_kode, tahun, jenis (INDIKATIF_RPJMD), jumlah_juta_rp, source_document_id, page_ref; unik (program_kode, tahun, jenis)              |
| `evidence`        | id, program_kode, jenis (RENCANA/ANGGARAN/PELAKSANAAN), source_document_id nullable, page_ref nullable, cakupan_pencarian, checked_at, catatan |

Catatan data yang perlu diingat:

- Nomor halaman adalah indeks halaman PDF, bukan nomor cetak.
- Tiga baris program punya selisih 1 sampai 2 juta antara total dan jumlah lima tahun; kemungkinan pembulatan di dokumen sumber. Kolom Total dan Cek jumlah tidak diimpor.
- `kondisi_awal` dan `target_2026` disimpan sebagai teks karena memakai koma desimal Indonesia dan, pada beberapa baris, titik ribuan (mis. "1.666").
- Pagu 2030 tetap disimpan walau periode RPJMD 2025-2029, karena tercetak di tabel; tampilkan sesuai tahun yang tercetak dan jangan menyebutnya realisasi.
- Pagu program (juta rupiah) dan pagu bidang urusan (rupiah penuh) tidak boleh dijumlahkan atau dibandingkan langsung.
- `bidang_kode` program adalah dua segmen pertama kode program (mis. 2.11.11 menjadi 2.11).
- Jumlah seluruh baris bidang urusan: Rp87.296.545.643.031 (44 baris berkode; baris jumlah tanpa kode dilewati saat impor).

## 9. API (MVP)

Semua respons yang memuat uang menyertakan `label`: "Pagu indikatif, bukan APBD dan bukan realisasi". Pesan error berbahasa Indonesia.

| Endpoint                  | Fungsi                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `GET /api/bidang-urusan`  | Daftar bidang dengan pagu indikatif 2026 dan proporsi                                          |
| `GET /api/program`        | Daftar program; parameter `bidang`, `status` (ada atau belum_diketahui untuk pelaksanaan), `q` |
| `GET /api/program/{kode}` | Detail: pagu per tahun, evidence, sumber, status bukti. 404 bila tidak ada                     |
| `GET /api/sumber`         | Dokumen sumber, versi, tanggal cek                                                             |

Draf PPID dibuat di web dari data program, dan pelacak memakai penyimpanan browser, jadi keduanya tidak butuh endpoint.

## 10. Arsitektur dan stack

- Monorepo: `apps/web`, `apps/api`, `packages/shared` (tipe, skema zod, helper), `data/`, `scripts/`, `docs/`.
- Backend: Hono di Cloudflare Workers (Wrangler), Drizzle ORM, PostgreSQL, zod, vitest.
- Web: Next.js (App Router, TypeScript).
- Package manager: **bun** (diputuskan 22 Okt setelah scaffold awal memakai pnpm; migrasi diminta, status belum dikonfirmasi). Runtime API tetap workerd; bun hanya manajer paket dan penjalan skrip.
- Koneksi Postgres dari Workers: Hyperdrive dengan `pg` dan `drizzle-orm/node-postgres` (pola dari dokumentasi resmi Cloudflare, dipilih Claude Code saat scaffold; lihat `docs/DECISIONS.md`). Lokal memakai `wrangler dev` dengan connection string lokal di `.env`.
- Host PostgreSQL produksi dan hosting web **belum diputuskan**.
- Heavy PDF extraction tidak dijalankan di Worker; lakukan lokal atau di CI. Cron Triggers Workers tersedia bila nanti butuh tugas terjadwal.

Format uang di antarmuka: ringkas (Rp7,7 T; Rp396 juta), angka penuh di tooltip yang bisa diakses keyboard. Helper `formatRupiahRingkas` dan `hitungStatusBukti` ada di `packages/shared`.

## 11. Draf PPID dan pelacak

- Draf berisi: tempat dan tanggal, tujuan surat ke PPID perangkat daerah, perihal, isi permohonan merujuk program (nama, kode, halaman PDF RPJMD), butir informasi yang diminta, tujuan dan cara memperoleh. Bagian dalam kurung siku diisi pengguna sendiri.
- Tenggat dihitung perkiraan: 10 hari kerja, dapat diperpanjang 7 hari kerja, tanpa memperhitungkan hari libur. **Ketentuan hukum dan hitungan ini belum diverifikasi tim**; letakkan semuanya di satu berkas konstanta bertanda TODO-REVIEW dan tampilkan catatan di halaman.
- Pelacak menyimpan data di localStorage (dengan versi skema dan validasi saat membaca). Status permohonan: Belum dijawab, Dijawab, Ditolak, Diperpanjang.

## 12. User story dan kriteria penerimaan

JR1 sampai JR3 pada tab induk di Doc diwujudkan oleh US-01 sampai US-03; JR4 oleh US-09.

| ID    | Prioritas | User story                                                                                                                               | Kriteria penerimaan                                                                                                                                                                                                                                                         |
| ----- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | P0        | Sebagai pengunjung, saya ingin melihat daftar program prioritas dengan status buktinya agar saya tahu program mana yang tercantum resmi. | Kartu menampilkan kode, bidang, nama, pagu indikatif 2026 ringkas, total 2026-2030, lencana status, dan halaman PDF. Pencarian, filter bidang, dan filter status bekerja dan tersimpan di URL. Tertulis jumlah yang tampil dari seluruh program.                            |
| US-02 | P0        | Sebagai pengunjung, saya ingin membuka satu program agar saya melihat indikator, pagu per tahun, dan sumbernya.                          | Detail menampilkan indikator, kondisi awal, target 2026, tabel pagu 2026-2030 dalam juta rupiah, dokumen sumber, halaman PDF, tanggal cek, dan label pagu indikatif. Kode yang tidak ada menghasilkan halaman 404 berbahasa Indonesia.                                      |
| US-03 | P0        | Sebagai pengunjung, saya ingin tahu batas bukti suatu program agar saya tidak menyimpulkan program gagal hanya karena bukti kosong.      | Tiga status (tercantum di rencana, dianggarkan, ada laporan pelaksanaan) ditampilkan. Belum diketahui adalah nilai bawaan, dengan cakupan pencarian dan tanggal bila ada, dan kalimat bahwa itu tidak berarti program gagal. Status tidak dibedakan hanya lewat warna.      |
| US-04 | P0        | Sebagai pengunjung, saya ingin melihat ke mana belanja daerah dialokasikan agar saya punya konteks sebelum memilih program.              | Beranda memuat bagan batang enam urusan pemerintahan dengan pagu terbesar, angka ringkas dan persentase, tooltip angka penuh yang dapat diakses keyboard, sumber dan tanggal cek, dan label pagu indikatif RKPD. Klik pada bidang mengarah ke daftar program terfilter.     |
| US-05 | P0        | Sebagai pengunjung, saya ingin membaca metodologi dan batas klaim agar saya tahu apa yang dilakukan dan tidak dilakukan situs.           | Halaman memuat dokumen sumber beserta tanggal cek, aturan status bukti, cara membaca pagu, daftar yang dilakukan dan tidak dilakukan, serta kontak koreksi.                                                                                                                 |
| US-06 | P1        | Sebagai pengunjung, saya ingin menyusun draf permohonan informasi ke PPID agar saya dapat meminta bukti yang belum ada.                  | Pratinjau surat berubah sesuai butir yang dicentang dan memuat nama, kode, dan halaman rujukan program. Bagian dalam kurung siku diisi pengguna. Tersedia salin teks dan unduh. Tidak ada data pemohon yang dikirim ke server. Situs tidak mengirim permohonan.             |
| US-07 | P1        | Sebagai pengunjung, saya ingin mencatat permohonan yang sudah saya kirim agar saya tahu tenggat jawabannya.                              | Form menyimpan program, perangkat daerah, dan tanggal kirim; tenggat perkiraan dan sisa hari tampil dengan catatan bahwa hari libur belum dihitung. Status dapat diubah per baris, ada ekspor dan impor, dan data rusak di penyimpanan browser tidak membuat halaman gagal. |
| US-08 | P1        | Sebagai kurator data, saya ingin mengimpor program dan pagu dari CSV agar data terisi dengan sumber dan halaman.                         | Seed idempoten, gagal dengan pesan jelas bila CSV tidak ada, melewati baris jumlah tanpa kode, menolak angka yang ambigu, dan setiap baris memuat dokumen sumber dan halaman. Tidak ada data tiruan di database pengembangan.                                               |
| US-09 | P2        | Sebagai pengunjung, saya ingin membawa ringkasan cetak agar saya dapat memakainya sebagai rujukan tulisan.                               | Cetak memuat daftar program, status, sumber, dan tanggal, tanpa opini atau penilaian.                                                                                                                                                                                       |

Definition of Done kartu program: sumber terlacak, jenis pendanaan eksplisit, state "tidak diketahui" berfungsi, alur ponsel dan keyboard diuji. Definition of Ready: program dan halamannya ditemukan dalam dokumen resmi.

## 13. Kebutuhan non-fungsional

Target angka belum ditetapkan atau diukur; yang tertulis adalah usulan awal untuk disepakati tim.

| Area           | Kebutuhan                                                                                                                                                   | Cara memeriksa                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Kebenaran data | Setiap angka punya sumber, halaman, dan tanggal cek; nol status tanpa bukti.                                                                                | Cek acak 2-3 baris sebelum first draft; audit penuh sebelum final |
| Netralitas     | Tanpa skor atau peringkat; bahasa seragam untuk semua program; Belum diketahui tidak berwarna merah.                                                        | Tinjauan redaksi oleh orang kedua sebelum rilis                   |
| Aksesibilitas  | Heading berurutan, fokus terlihat, kontras cukup, label form, tooltip dapat diakses keyboard, status tidak hanya lewat warna.                               | Uji keyboard dan pemeriksa otomatis; target skor belum ditetapkan |
| Responsif      | Nyaman di ponsel (satu kolom); desktop 1280 sebagai acuan.                                                                                                  | Pemeriksaan visual pada lebar 360 dan 1280                        |
| Performa       | Halaman data utama termuat ringan; target waktu muat belum ditetapkan.                                                                                      | Ukur awal setelah web berjalan, lalu tetapkan target              |
| Privasi        | Tanpa akun; data Pelacak hanya di browser; draf PPID dibuat di browser dan tidak dikirim ke server; tidak memakai analytics pihak ketiga pada MVP (usulan). | Tinjauan kode dan permintaan jaringan                             |
| Keamanan       | API hanya membaca (GET); query divalidasi zod; CORS dibatasi pada domain web saat rilis; rahasia tidak masuk repo.                                          | Tinjauan konfigurasi sebelum deploy                               |
| Kompatibilitas | Peramban modern versi terbaru; versi minimal belum ditetapkan.                                                                                              | Uji di Chrome dan satu peramban lain                              |
| Bahasa         | Antarmuka dan pesan API berbahasa Indonesia.                                                                                                                | Tinjauan teks                                                     |

## 14. Tata kelola data

- Setiap baris data memuat dokumen sumber, halaman PDF, dan tanggal cek. Data baru yang belum diperiksa orang kedua terhadap PDF ditandai verified = false (usulan).
- Bukti ANGGARAN atau PELAKSANAAN hanya dicatat bila dokumen dan halaman rujukannya ada. Pencarian tanpa hasil dicatat sebagai cakupan pencarian dan tanggal, dan status tetap belum diketahui.
- Bila RPJMD berubah lewat perubahan perda, versi dokumen baru ditambahkan dan versi lama tidak ditimpa diam-diam (usulan).
- Koreksi dari pengunjung diterima lewat kontak koreksi [belum ditetapkan] dan dicatat tanggalnya.
- Penanggung jawab data dan frekuensi tinjauan: [diisi tim].

## 15. Metrik dan validasi

Baseline diukur pada tahap discovery; ukuran sampel kecil memberi sinyal kegunaan, bukan estimasi populasi.

| Metrik                          | Target (usulan)                                                           | Baseline     | Cara ukur                                 |
| ------------------------------- | ------------------------------------------------------------------------- | ------------ | ----------------------------------------- |
| Ketepatan status pada uji tugas | 4 dari 5 pengguna menyebut status yang benar tanpa bantuan                | Belum diukur | Uji lima pengguna terhadap kunci reviewer |
| Menemukan sumber                | 4 dari 5 menemukan sumbernya                                              | Belum diukur | Uji lima pengguna                         |
| Kesimpulan keliru               | Tidak ada yang menyimpulkan program diingkari saat status belum diketahui | Belum diukur | Pertanyaan pasca-tugas                    |
| Status yang bersumber           | 100% status memiliki sumber dan halaman                                   | Belum diukur | Audit baris sebelum rilis                 |
| Penilaian atau peringkat        | 0 elemen penilaian kepala daerah                                          | Belum diukur | Tinjauan redaksi                          |
| Waktu tugas                     | Median waktu belum ditetapkan                                             | Belum diukur | Uji lima pengguna                         |

Uji lima pengguna: periksa dua program setara, satu memakai dokumen asli dan satu memakai prototype (urutan ditukar). Ukur ketepatan status terhadap kunci reviewer, waktu tugas, dan kemampuan membedakan "belum diketahui" dari "tidak dijalankan". Belum dilaksanakan.

## 16. Kriteria rilis

**First draft, 1 November 2026**

- Repository publik dengan README dan .env.example; proyek dapat dijalankan dari nol mengikuti README.
- 10 program tampil dengan sumber, halaman, dan tanggal cek; cek acak 2 sampai 3 baris terhadap PDF asli selesai.
- Enam layar berfungsi pada desktop dan ponsel, termasuk keadaan kosong dan error.
- PDF draf maksimal 10 halaman dengan minimal dua tangkapan layar.
- Teks PPID dan hitungan tenggat ditandai belum ditinjau hukum bila belum selesai ditinjau.

**Final, 11 November 2026**

- Audit seluruh rujukan dan status; tinjauan bahasa netral; nol status tanpa bukti.
- Teks hukum PPID dan hitungan tenggat ditinjau, atau ditandai jelas pada situs.
- Uji lima pengguna dilakukan dan hasilnya dicatat; keputusan lanjut atau pivot ditulis.
- Video dan proposal siap; bobot penilaian final diklarifikasi dengan panitia.

**Onsite, 28 November 2026**

- Demo memiliki cadangan lokal (data dan aplikasi) bila koneksi bermasalah.

## 17. Linimasa

| Tanggal               | Fokus                                                                             | Keluaran                                                                             |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 22-25 Oktober         | Scaffold monorepo, data awal, wireframe; mulai web                                | Repo berjalan dengan API dan data nyata; wireframe enam layar                        |
| 26 Oktober-1 November | Implementasi US-01 sampai US-07; README dan PDF draf                              | First draft: repo publik, README, PDF maksimal 10 halaman dengan dua tangkapan layar |
| 3-8 November          | Review mentor dan perbaikan; keputusan fitur baru menyebut fitur yang digeser     | Perbaikan berdasarkan masukan                                                        |
| 8-10 November         | Stabilisasi, audit rujukan dan status, pemeriksaan netralitas, video dan proposal | Paket final                                                                          |
| 11 November           | Submit final                                                                      | Final submission                                                                     |
| 28 November           | Demo onsite bila lolos                                                            | Demo dengan cadangan lokal                                                           |

- Guidebook menyebut satu kali 2 November untuk first draft; 1 November dipakai sebagai target aman.
- Tabel bobot final di guidebook hanya menjumlah 80% walau total tertulis 100%: perlu klarifikasi panitia.

## 18. Pemilik dan tanggung jawab

| Peran                | Tanggung jawab                                                     | Nama        |
| -------------------- | ------------------------------------------------------------------ | ----------- |
| PM dan PO            | Lingkup, prioritas, keputusan, kebenaran bukti                     | Hapis       |
| Dev API dan data     | apps/api, skema, migrasi, seed, impor data                         | [diisi tim] |
| Dev web              | apps/web, integrasi API, draf PPID, pelacak                        | [diisi tim] |
| UI/UX                | Desain visual dari wireframe, komponen, aksesibilitas              | [diisi tim] |
| Reviewer data dan QA | Pemeriksaan rujukan terhadap PDF, status, netralitas, uji pengguna | [diisi tim] |

## 19. Risiko dan ketergantungan

| Risiko atau ketergantungan                              | Dampak                                   | Mitigasi                                                                |
| ------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Data pelaksanaan per program tidak terbuka              | Status pelaksanaan tetap belum diketahui | Belum diketahui sebagai nilai bawaan yang netral; jalur permohonan PPID |
| Kesalahan salin angka atau halaman dari PDF             | Informasi keliru pada situs transparansi | Cek acak, audit penuh, reviewer kedua, flag verified                    |
| Tampilan dianggap partisan                              | Kepercayaan menurun                      | Tanpa skor; bahasa seragam; sumber resmi; halaman netralitas            |
| RPJMD berubah lewat perubahan perda                     | Data usang                               | Versi dan tanggal cek dokumen dicatat; versi baru ditambahkan           |
| Teks hukum PPID dan tenggat belum ditinjau              | Draf salah rujukan                       | Konstanta terpusat bertanda TODO-REVIEW; tinjauan sebelum final         |
| Waktu pengerjaan singkat sampai 1 November              | Fitur P1 bergeser                        | Prioritas P0, P1, P2; pergeseran fitur harus disebut                    |
| Host PostgreSQL dan hosting web belum diputuskan        | Demo publik tertunda                     | Putuskan awal; cadangan lokal untuk demo                                |
| Dokumen sumber Bappeda berubah atau tidak dapat diakses | Rujukan tautan rusak                     | Simpan versi dan tanggal cek; salinan lokal untuk audit                 |
| Ketentuan bobot dan tanggal lomba tidak konsisten       | Salah sasaran penilaian                  | Klarifikasi panitia; gunakan target aman 1 November                     |

## 20. Keputusan dan hal terbuka

Sudah diputuskan:

- Unit yang dilacak: program prioritas RPJMD, bukan janji kampanye.
- Tanpa skor atau peringkat; Belum diketahui adalah status bawaan dan netral.
- Backend API terpisah dalam monorepo: Hono, Drizzle, PostgreSQL, Cloudflare Workers; web memakai Next.js; package manager bun.
- Angka pagu ringkas pada antarmuka dengan angka penuh pada tooltip; label pagu indikatif wajib.

Masih terbuka:

- Host PostgreSQL produksi dan hosting web.
- Nama produk: JejakJanji, JejakRencana, atau JejakProgram.
- Tabel 5.20 RKPD menyebut 6 bidang unsur penunjang tetapi hanya 5 baris terbaca; periksa PDF 482-483.
- Peninjauan hukum untuk teks permohonan dan hitungan tenggat PPID; kontak koreksi.
- Klarifikasi panitia: tabel bobot final di guidebook hanya menjumlah 80%; guidebook menyebut satu kali 2 November untuk first draft (1 November dipakai sebagai target aman).
- Cek acak 2 sampai 3 baris Sheet ke PDF asli oleh tim sebelum dipakai di pitch.
- Beranda menampilkan 82 program prioritas daerah, bersumber pada RPJMD Tabel III.28, mulai PDF 337 (diperiksa 22 Oktober 2026).
- Skema MVP menyimpan indikator pertama sebagai indikator utama. Program 2.11.11 memiliki dua indikator dan 1.04.02 memiliki tiga; tabel seluruh indikator ditunda tanpa mengubah skema.

Hipotesis dan status validasi:

| Hipotesis                                                                                 | Status per 22 Oktober 2026                                                                   |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| JJ-A1: program RPJMD dapat dipetakan ke item APBD dengan aturan tertulis                  | Belum diuji; di luar MVP. Kesamaan nama di RKPD hanya kandidat tautan                        |
| JJ-A2: data pelaksanaan per program tersedia dari sumber resmi                            | Belum ditemukan; portal Bappeda (Kinerja dan Cascading) tidak menyediakan status per program |
| JJ-A3: status berbasis bukti lebih mudah dipahami daripada membaca RPJMD dan APBD sendiri | Belum diuji; diuji pada uji lima pengguna                                                    |
| JJ-A4: tampilan netral berbasis sumber resmi cukup menarik dan tidak terkesan partisan    | Belum diuji; diuji pada wawancara dan uji pengguna                                           |

## 21. Klaim yang jangan dipakai di pitch sebelum diperiksa

- Bahwa warga "harus membuka dokumen satu per satu": dasar kuat hanya setelah menu Kinerja dan Cascading portal Bappeda diperiksa. Pemeriksaan 22 Oktober: portal tidak menyediakan status per program. Pakai kalimat yang lebih aman: satu kartu menyatukan rencana, anggaran, dan bukti.
- Status aktif dan fitur terkini Kawal Jakarta, JAGA KPK, dan Promise Tracker (sumber ada yang berusia bertahun-tahun, belum diuji langsung).
- Segala bentuk "janji tidak ditepati" atau "sudah terealisasi".
- Kesesuaian subtema: tulis jujur. Open Government Data dan Data-Driven Decision Support kuat; Civic Reporting and Accountability dan Public Service Tracking sebagian (yang dilacak adalah permohonan informasi publik, bukan laporan kerusakan atau status layanan seperti perizinan atau bansos).

## 22. Sumber utama

- RPJMD lengkap (393 hlm): https://bappeda.jakarta.go.id/show_file/doc_list/EyJrGwJ8u84AkWxoQW7VWuTgpTz1TMr45Q3dbRAF.pdf
- RKPD 2026 (549 hlm): https://bappeda.jakarta.go.id/show_file/doc_list/kO5eh8zrQTzJVKQFtpoYr0wXrAvXKvMdOlUcxwCt.pdf
- Portal RPJMD Bappeda dan daftar dokumen: https://bappeda.jakarta.go.id/rpjmd/documents
- Naskah Perda 2/2025: https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2025PERDA00312.pdf
- DJPK portal agregat APBD: https://djpk.kemenkeu.go.id/portal/data/apbd
- Google Sheet 10 program: https://docs.google.com/spreadsheets/d/1E8lwIA58hL_HoqZEGPn9nnbSodJ5_CZZpnjGh6LuRIE/edit
- Google Sheet pagu per bidang urusan: https://docs.google.com/spreadsheets/d/1KRde1vABrhvzn8DCLKJfhXVfUArZfD7MHmcwmAUpe4w/edit
- Wireframe: https://claude.ai/artifact/6HghWBub52Ef1WThza4iSw
