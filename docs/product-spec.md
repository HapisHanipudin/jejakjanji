# JejakJanji: Spesifikasi Produk

Versi 22 Oktober 2026. Ringkasan untuk pengembang, disusun dari Google Doc "MIA WIA 2026 — Product Planning" (tab JejakJanji dan dua subtabnya). Doc tetap jadi tempat perencanaan tim; berkas ini adalah acuan yang ikut di repo. Jika keduanya berbeda, bahas dulu di tim lalu perbarui berkas ini.

Status: **rencana yang disetujui tim untuk dibangun, bukan produk yang sudah divalidasi.** Hal yang masih hipotesis ditandai. Nama produk masih terbuka (JejakJanji, JejakRencana, atau JejakProgram).

## 1. Ringkasan

Situs transparansi yang memudahkan warga memeriksa **program prioritas DKI Jakarta dalam RPJMD 2025-2029**: program mana yang tercantum resmi, berapa pagu indikatifnya, dan bukti apa yang tersedia. Bila bukti belum ada, warga dapat membuat **draf permohonan informasi ke PPID** dan mencatat tenggat jawabannya.

Yang dilacak adalah **program prioritas RPJMD, bukan janji kampanye**. Hubungan program dengan janji tertentu belum dibuktikan dan tidak diklaim.

Konteks lomba: Web In Action, MIA 2026 (UPN Veteran Jakarta). Tema: "Designing Digital Futures, Powering Public Transparency". Bobot penyisihan: fungsi 25, orisinalitas 20, desain 20, konten 20, kesesuaian tema 15.

Nilai jual yang boleh dipakai:
- Satu kartu program menyatukan rencana, anggaran, dan bukti.
- Setiap angka punya sumber, halaman PDF, dan tanggal cek. Bila bukti kosong, sistem menulis "belum diketahui" dan tidak menuduh program gagal.
- Tanpa skor atau peringkat kepala daerah.
- Pengguna dapat bertindak lewat jalur permohonan informasi resmi.

## 2. Pengguna dan peran

- **Pengunjung** (mahasiswa, jurnalis, warga pemantau): tanpa akun. Membaca, membuat draf permohonan, dan mencatat tenggat di browser. Persona Bagas (mahasiswa politik, menulis evaluasi untuk pers kampus) bersifat ilustratif.
- **Kurator data** (tim): memasukkan dan meninjau program dan bukti lewat skrip impor dari CSV. Tidak ada halaman admin di MVP.

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

**Masuk:** satu daerah (DKI Jakarta), 10 program awal dari 295 program RPJMD, enam layar (di bawah), empat endpoint baca, draf PPID di browser, pelacak di browser.

**Di luar MVP:** perbandingan antardaerah, label keterbandingan, laporan warga atau bukti dari warga, agregat hasil permohonan, daerah kedua, halaman admin, notifikasi pengingat (pengingat tenggat hanya teks di halaman), pemetaan program ke item APBD, cetak ringkasan (JR4, P1 pada rencana awal), prediksi, putusan benar atau salah atas klaim pihak mana pun.

Prioritas pengerjaan: daftar program, status berbukti, lalu tautan anggaran. Perubahan lingkup selama sprint harus menyebut fitur yang digeser.

## 5. User journey

| Langkah | Aksi pengunjung | Layar | Hasil |
|---|---|---|---|
| 1 | Membuka beranda | Beranda | Melihat ke mana belanja daerah dialokasikan per bidang urusan (pagu indikatif RKPD 2026) |
| 2 | Memilih bidang | Daftar Program | Kartu program dengan status bukti, filter bidang |
| 3 | Membuka satu program | Detail Program | Rujukan halaman RPJMD, pagu indikatif 2026 sampai 2030, indikator, status bukti |
| 4 | Bukti belum ada, menekan "Minta informasi ke PPID" | Draf Permohonan PPID | Draf teks siap salin berisi kode program dan halaman rujukan |
| 5 | Mengirim sendiri, mencatat tanggal kirim | Pelacak Permohonan | Tenggat dihitung (perkiraan), data tersimpan di browser |
| 6 | Ingin tahu batas klaim | Metodologi dan Netralitas | Sumber, tanggal cek, hal yang tidak dilakukan produk |

## 6. Sitemap dan layar

Wireframe low-fi 6 layar (data nyata dari dua Sheet): https://claude.ai/artifact/6HghWBub52Ef1WThza4iSw. Wireframe adalah acuan struktur dan isi; tampilan visual akan dipoles desainer UI/UX.

| Rute | Layar | Isi pokok |
|---|---|---|
| `/` | Beranda | Judul dan pengantar; bagan batang belanja per bidang urusan 2026 (enam urusan pemerintahan dengan pagu terbesar; unsur penunjang seperti Keuangan dan Kecamatan tidak ikut; tooltip angka penuh, sumber dan tanggal cek); tiga kartu Rencana, Anggaran, Bukti |
| `/program` | Daftar Program | Cari nama atau kode; filter Bidang dan Status bukti (di query string); kartu 3 kolom desktop, 1 kolom ponsel: kode, bidang, nama, pagu 2026, total 2026-2030, lencana status, halaman PDF |
| `/program/[kode]` | Detail Program | Indikator (kondisi awal, target 2026); tabel pagu 2026-2030 dengan bagan sederhana; sumber dan tanggal cek; kartu Status bukti; tombol ke PPID |
| `/program/[kode]/ppid` | Draf PPID | Pilihan informasi yang diminta; pratinjau surat; salin, unduh, lanjut ke Pelacak. Dibuat sepenuhnya di browser |
| `/pelacak` | Pelacak | Form catat permohonan; tabel permohonan saya dengan status; ekspor dan impor JSON. localStorage |
| `/metodologi` | Metodologi dan Netralitas | Dokumen sumber, aturan status bukti, cara membaca pagu, yang dilakukan dan tidak dilakukan, kontak koreksi. `/netralitas` dialihkan ke `/metodologi#netralitas` |

State wajib ada di antarmuka: program tanpa pemetaan anggaran, status "belum diketahui", dokumen sumber tidak dapat dibuka, kode program tidak ditemukan (404 berbahasa Indonesia), daftar kosong, dan error API.

Catatan: spesifikasi lama di tab induk menyebut layar "pilih daerah" dan layar "konteks anggaran per fungsi" terpisah. Untuk MVP satu daerah, yang berlaku adalah sitemap di atas (konteks anggaran ada di Beranda).

## 7. Status bukti

Dihitung dari tabel `evidence`, tidak disimpan sebagai kolom.

| Status | Arti | Syarat "ada" |
|---|---|---|
| Tercantum di rencana | Program ada di RPJMD | Bukti jenis RENCANA dengan dokumen dan halaman |
| Dianggarkan | Ada pagu pada dokumen anggaran (RKPD atau APBD) | Bukti jenis ANGGARAN dengan dokumen dan halaman atau baris rujukan |
| Ada laporan pelaksanaan | Ada dokumen capaian yang relevan (mis. LKPJ, laporan kinerja) | Bukti jenis PELAKSANAAN dengan dokumen dan halaman |
| Belum diketahui | Bawaan: bukti belum ditemukan dalam cakupan pencarian yang dicatat, lengkap dengan tanggal | Bukan penilaian bahwa program gagal |

Aturan implementasi (keputusan saat scaffold): hanya evidence yang punya `source_document_id` yang dihitung "ada". Baris yang hanya berisi `cakupan_pencarian` tetap "belum diketahui". Pagu indikatif RPJMD yang sudah ada belum otomatis berarti "Dianggarkan"; rujukan RKPD atau APBD per program belum ditemukan.

## 8. Data

Sumber:
- **RPJMD DKI Jakarta 2025-2029** (Perda 2 Tahun 2025), 393 halaman PDF. Program prioritas, indikator, pagu indikatif 2026-2030 dalam **juta rupiah**. Daftar program prioritas ada di PDF 337-374 (295 baris terekstrak).
- **RKPD 2026** (Pergub 21 Tahun 2025), 549 halaman PDF. Pagu indikatif **per bidang urusan** dalam **rupiah penuh** (Tabel 5.16 sampai 5.23, PDF 480-483). RKPD memuat pagu per bidang urusan dan per perangkat daerah, **bukan per program**.
- Awal: dua Google Sheet (10 program; pagu per bidang urusan) diekspor ke `data/program.csv` dan `data/bidang_urusan.csv`. CSV hanya sumber impor; data hidup di database.

Skema (lima tabel):

| Tabel | Kolom |
|---|---|
| `source_document` | id, title, type (RPJMD/RKPD), url nullable, version, checked_at |
| `bidang_urusan` | kode (pk), nama, pagu_indikatif_2026 (rupiah), proporsi, source_document_id, page_ref |
| `program` | kode (pk), nama, bidang_kode, indikator, satuan, kondisi_awal, target_2026, source_document_id, page_ref, verified |
| `funding` | id, program_kode, tahun, jenis (INDIKATIF_RPJMD), jumlah_juta_rp, source_document_id, page_ref; unik (program_kode, tahun, jenis) |
| `evidence` | id, program_kode, jenis (RENCANA/ANGGARAN/PELAKSANAAN), source_document_id nullable, page_ref nullable, cakupan_pencarian, checked_at, catatan |

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

| Endpoint | Fungsi |
|---|---|
| `GET /api/bidang-urusan` | Daftar bidang dengan pagu indikatif 2026 dan proporsi |
| `GET /api/program` | Daftar program; parameter `bidang`, `status` (ada atau belum_diketahui untuk pelaksanaan), `q` |
| `GET /api/program/{kode}` | Detail: pagu per tahun, evidence, sumber, status bukti. 404 bila tidak ada |
| `GET /api/sumber` | Dokumen sumber, versi, tanggal cek |

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

## 12. Kriteria penerimaan (MVP)

- **JR1 (P0):** setiap program menampilkan kode, nama, bidang, halaman PDF, dokumen dan versi sumber. Teks RPJMD tidak diberi label janji kampanye.
- **JR2 (P0):** setiap angka pagu menampilkan satuan, sumber, halaman, tanggal cek, dan label pagu indikatif. Bila pemetaan ke anggaran tidak tersedia, tertulis "belum tersedia".
- **JR3 (P0):** status bukti dipisahkan dari status pelaksanaan program. "Belum diketahui" adalah bawaan; "tidak ditemukan di dokumen" adalah catatan pencarian dengan cakupan tertulis, bukan status kegagalan.
- **JR4 (P1):** ringkasan cetak memuat daftar program, status, sumber, dan tanggal, tanpa opini.
- Definition of Done kartu program: sumber terlacak, jenis pendanaan eksplisit, state "tidak diketahui" berfungsi, alur ponsel dan keyboard diuji.

## 13. Validasi

Uji dengan lima pengguna: periksa dua program setara, satu memakai dokumen asli dan satu memakai prototype (urutan ditukar). Ukur ketepatan status terhadap kunci reviewer, waktu tugas, dan kemampuan membedakan "belum diketahui" dari "tidak dijalankan". Target usulan: 4 dari 5 menyebut status yang benar tanpa bantuan; 4 dari 5 menemukan sumbernya; tidak ada yang menyimpulkan program diingkari ketika statusnya belum diketahui. Ini sinyal kegunaan, bukan estimasi populasi, dan belum dilaksanakan.

## 14. Linimasa

- 1 November 2026: first draft (repo publik, README, PDF draf maksimal 10 halaman dengan minimal 2 tangkapan layar). Guidebook menyebut satu kali 2 November; 1 November dipakai sebagai target aman.
- 3-8 November: review mentor dan perbaikan.
- 8-10 November: stabilisasi, audit semua rujukan dan status, pemeriksaan bahasa netral, video dan proposal.
- 11 November: final submission. 28 November: final onsite (siapkan cadangan lokal).
- Tabel bobot final di guidebook hanya menjumlah 80% walau total tertulis 100%: perlu klarifikasi panitia.

## 15. Terbuka dan risiko

Terbuka:
- Host PostgreSQL produksi (mis. Supabase atau Neon) dan hosting web.
- Cek acak 2 sampai 3 baris Sheet ke PDF asli oleh tim sebelum dipakai di pitch.
- Tabel 5.20 RKPD menyebut 6 bidang unsur penunjang tetapi hanya 5 baris terbaca; periksa PDF 482-483.
- Nama produk dan kontak koreksi (placeholder di halaman Metodologi).
- Jumlah "295 program" di Beranda adalah konstanta sementara sampai ada sumbernya di API.
- Peninjauan hukum untuk teks permohonan dan tenggat PPID.

Risiko: data pelaksanaan per program tidak terbuka; pemetaan program ke anggaran keliru; tampilan dianggap partisan; RPJMD berubah lewat perubahan perda (catat versi dokumen). Tunda rilis suatu program bila tidak dapat dikutip dengan halaman rujukan.

## 16. Klaim yang jangan dipakai di pitch sebelum diperiksa

- Bahwa warga "harus membuka dokumen satu per satu": dasar kuat hanya setelah menu Kinerja dan Cascading portal Bappeda diperiksa. Pemeriksaan 22 Oktober: portal tidak menyediakan status per program. Pakai kalimat yang lebih aman: satu kartu menyatukan rencana, anggaran, dan bukti.
- Status aktif dan fitur terkini Kawal Jakarta, JAGA KPK, dan Promise Tracker (sumber ada yang berusia bertahun-tahun, belum diuji langsung).
- Segala bentuk "janji tidak ditepati" atau "sudah terealisasi".
- Kesesuaian subtema: tulis jujur. Open Government Data dan Data-Driven Decision Support kuat; Civic Reporting and Accountability dan Public Service Tracking sebagian (yang dilacak adalah permohonan informasi publik, bukan laporan kerusakan atau status layanan seperti perizinan atau bansos).

## 17. Sumber utama

- RPJMD lengkap (393 hlm): https://bappeda.jakarta.go.id/show_file/doc_list/EyJrGwJ8u84AkWxoQW7VWuTgpTz1TMr45Q3dbRAF.pdf
- RKPD 2026 (549 hlm): https://bappeda.jakarta.go.id/show_file/doc_list/kO5eh8zrQTzJVKQFtpoYr0wXrAvXKvMdOlUcxwCt.pdf
- Portal RPJMD Bappeda dan daftar dokumen: https://bappeda.jakarta.go.id/rpjmd/documents
- Naskah Perda 2/2025: https://jdih.jakarta.go.id/dokumenPeraturanDirectory/0031/2025PERDA00312.pdf
- DJPK portal agregat APBD: https://djpk.kemenkeu.go.id/portal/data/apbd
- Google Sheet 10 program: https://docs.google.com/spreadsheets/d/1E8lwIA58hL_HoqZEGPn9nnbSodJ5_CZZpnjGh6LuRIE/edit
- Google Sheet pagu per bidang urusan: https://docs.google.com/spreadsheets/d/1KRde1vABrhvzn8DCLKJfhXVfUArZfD7MHmcwmAUpe4w/edit
- Wireframe: https://claude.ai/artifact/6HghWBub52Ef1WThza4iSw
