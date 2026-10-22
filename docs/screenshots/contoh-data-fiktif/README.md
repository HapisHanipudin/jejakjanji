# Tangkapan layar dengan DATA FIKTIF

**Jangan pakai gambar di folder ini untuk draf PDF lomba.**

Gambar dibuat 2026-10-22 dari database uji sementara berisi data sintetis berlabel "FIKTIF",
karena `data/program.csv` dan `data/bidang_urusan.csv` belum ada di repo. Nama, indikator, dan angka
di gambar bukan data RPJMD/RKPD. Angka pagu program 2.11.11 sengaja disusun agar sama dengan contoh di
brief (Rp1,32 T, hal. PDF 345, total 7.691.668 juta), hanya untuk menguji tampilan.

Ambil ulang setelah CSV asli diekspor dan `bun run db:seed` berhasil.

| Berkas                | Halaman                     | Viewport |
| --------------------- | --------------------------- | -------- |
| `1-beranda.png`       | `/`                         | 1280     |
| `2-program.png`       | `/program`                  | 1280     |
| `3-detail.png`        | `/program/2.11.11`          | 1280     |
| `4-ppid.png`          | `/program/2.11.11/ppid`     | 1280     |
| `5-pelacak.png`       | `/pelacak` (satu baris uji) | 1280     |
| `6-metodologi.png`    | `/metodologi`               | 1280     |
| `7-detail-ponsel.png` | `/program/2.11.11`          | 390      |
