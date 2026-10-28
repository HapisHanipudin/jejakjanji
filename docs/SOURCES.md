# Dokumen sumber

Kedua dokumen di-seed ke tabel `source_document` oleh `scripts/seed.ts`.

| Tipe  | Judul                                | Versi / dasar hukum        | Halaman PDF | URL                                                                                                      | Tanggal cek |
| ----- | ------------------------------------ | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| RPJMD | RPJMD Provinsi DKI Jakarta 2025-2029 | Perda Nomor 2 Tahun 2025   | 393         | https://bappeda.jakarta.go.id/rpjmd/storage/documents/files/TSkak06jYdL7FKLrgZORdCW0MyLm36oR0ckv6m9p.pdf | 2026-10-22  |
| RKPD  | RKPD Provinsi DKI Jakarta 2026       | Pergub Nomor 21 Tahun 2025 | 549         | https://bappeda.jakarta.go.id/show_file/doc_list/kO5eh8zrQTzJVKQFtpoYr0wXrAvXKvMdOlUcxwCt.pdf            | 2026-10-22  |

Catatan:

- Jumlah halaman PDF tidak punya kolom di skema; dicatat di sini saja.
- Angka pagu dari RPJMD adalah pagu indikatif, bukan APBD dan bukan realisasi.
- Tiga baris di `program.csv` punya selisih 1-2 juta antara jumlah per tahun dan kolom total
  karena pembulatan di dokumen sumber. Seed menyimpan angka per tahun dan mengabaikan kolom total.
