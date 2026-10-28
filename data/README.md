# data/

`scripts/seed.ts` membaca dua file berikut. Keduanya tersedia di repo: 10 program dan 44 bidang urusan berkode, ditambah satu baris jumlah tanpa kode yang dilewati seed. Berkas berasal dari ekspor Google Sheet tim. Seed berhenti dengan pesan galat bila salah satunya tidak ada. Jangan
mengisi file ini dengan data karangan.

## Cara ekspor

1. Buka Google Sheet, pilih tab yang sesuai.
2. File > Download > Comma-separated values (.csv).
3. Simpan dengan nama persis di bawah ke folder `data/`.
4. Jalankan `bun run db:seed`.

Ekspor dari Sheet dengan lokal Indonesia: angka bulat memakai titik ribuan (`19.550.176.404.217`)
atau tanpa pemisah; desimal memakai koma (`12,34`). Seed **menolak** angka bulat yang memakai
koma, karena koma bisa berarti desimal atau ribuan dan seed tidak menebak.

## `program.csv`

Header (urutan bebas, nama persis):

`Kode, Program prioritas, Bidang (PD penanggung jawab), Indikator, Satuan indikator, Kondisi awal, Target 2026, Pagu 2026, Pagu 2027, Pagu 2028, Pagu 2029, Pagu 2030, Total 2026-2030, Halaman PDF, Sumber, Satuan pagu, Cek jumlah 2026-2030`

- Pagu dalam juta rupiah (`Satuan pagu` harus memuat kata "juta"). Disimpan per tahun ke tabel `funding`.
- Sel pagu kosong dilewati (tidak ada baris `funding` untuk tahun itu).
- `Total 2026-2030`, `Cek jumlah 2026-2030`, dan `Bidang (PD penanggung jawab)` diabaikan.
- `Kondisi awal` dan `Target 2026` disimpan apa adanya sebagai teks.
- Bidang program diturunkan dari dua segmen pertama kode (`2.11.11` -> `2.11`) dan harus ada di `bidang_urusan.csv`.
- `Sumber` harus menyebut tepat satu dari `RPJMD` atau `RKPD`.

## `bidang_urusan.csv`

Header:

`Kode, Bidang urusan / unsur, Pagu indikatif 2026 (Rp), Proporsi belanja (%) menurut dokumen, Halaman PDF, Sumber`

- Pagu dalam rupiah penuh.
- Baris tanpa `Kode` (baris jumlah) dilewati.
