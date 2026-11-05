# Tindak lanjut audit 002 (2026-11-05)

Nomor yang disetujui: semua, 1 sampai 8. Basis: `006e99b`. Belum di-commit.

## Hasil per nomor

| No  | Status  | Perubahan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Bukti                                                                                                                                                                                                                                              |
| --- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Selesai | `PpidDraft.tsx`: `pre.letter` mendapat `tabIndex={0}`, `role="region"`, dan `aria-label="Isi surat"`. Fokusnya memakai cincin global yang sudah ada.                                                                                                                                                                                                                                                                                                                                                                                                              | axe: 0 pelanggaran di PPID pada keempat lebar (sebelumnya `scrollable-region-focusable` di 1440 dan 1280).                                                                                                                                         |
| 2   | Selesai | `globals.css`: <ul><li>Trek grid `1fr` menjadi `minmax(0, 1fr)`; grid satu kolom implisit (panel status, tahap program, identitas program) diberi trek yang sama.</li><li>`overflow-wrap: break-word` di `body`.</li><li>Lencana tahap boleh turun baris; label langkah tidak lagi `nowrap`, dan line-height-nya relatif.</li><li>Anak `.box-head` boleh menyempit.</li><li>`thead` tabel kartu benar-benar tersembunyi (`display: block`).</li><li>Tooltip uang disembunyikan dengan `display`, bukan `visibility`.</li><li>Dua ukuran px menjadi rem.</li></ul> | Teks root 200%: 0 dari 40 kombinasi melebar (sebelumnya 17). Ukuran normal: 0 dari 28 overflow.                                                                                                                                                    |
| 3   | Selesai | Ukuran baca `36em` (sekitar 75 karakter) untuk `.lead`, paragraf langsung di `.box`, dan notice berisi beberapa paragraf. Notice menyempit sebagai satu kotak agar latarnya mengikuti teks. Satuan `ch` dicoba dulu, tetapi untuk font ini masih menghasilkan sekitar 100 karakter.                                                                                                                                                                                                                                                                               | Detector `line-length`: 0 temuan (sebelumnya 6).                                                                                                                                                                                                   |
| 4   | Selesai | Logo, `.link-strong`, `.money-value`, dan tautan daerah di landing mendapat area klik tak terlihat setinggi 44px lewat `::after`, tanpa menggeser layout. Tombol kalender 40 menjadi 44px.                                                                                                                                                                                                                                                                                                                                                                        | Area klik terukur di 390px: tautan daerah 44, logo 43, uang di beranda 43, uang di detail 37, aksi teks 36. Area klik yang tidak mencapai 44 terpotong oleh target tetangga yang jaraknya kurang dari 44px. Semua tetap di atas 24px (WCAG 2.5.8). |
| 5   | Selesai | `p, li { text-wrap: pretty }` di lapisan dasar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Detector `straggler`: 0 temuan (sebelumnya 20 lebih).                                                                                                                                                                                              |
| 6   | Selesai | `text-wrap: balance` pada `.program-id h3`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Detector `unbalanced-heading`: 0 temuan.                                                                                                                                                                                                           |
| 7   | Selesai | `tokens.css`: `--shadow-ink` (dipakai 8 bayangan dan backdrop dialog) dan `--text-md` (20px). Ukuran 26px, 1.625rem, 1.375rem, 1.125rem, dan 0.875rem dipetakan ke token terdekat. Radius 4, 12, dan 16px dipetakan ke `--radius-sm` dan `--radius-lg`. DESIGN.md mencatat langkah 20px, judul landing yang fluid, ukuran baca, area klik 44px, dan warna bayangan.                                                                                                                                                                                               | Detector sumber: 0 temuan (sebelumnya 9). Tidak ada lagi `19 38 59` di `globals.css`.                                                                                                                                                              |
| 8   | Selesai | `input[type='date']` diberi `height: 48px`; Chrome sebelumnya merendernya setinggi 50px.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Ketiga kolom pelacak: label di y 610.6, kontrol 639 sampai 687, tinggi 48.                                                                                                                                                                         |

## Perubahan visual yang perlu diketahui

- Teks lead dan paragraf panjang kini lebih sempit di desktop. Di bagan beranda, baris sumber lengkap menjadi dua baris.
- Catatan tenggat di pelacak kini berupa kotak biru selebar teksnya, bukan pita selebar formulir.
- Angka "dari 82" di beranda daerah turun dari 26 ke 24px. Judul langkah demo naik dari 26 ke 28px di desktop dan dari 22 ke 24px di landing.

## Pemeriksaan

- `bun run typecheck`: lulus.
- `bun run lint`: lulus.
- `bun run test`: 45 lulus, 3 dilewati (butuh DB).
- `next build --webpack`: lulus.
- axe-core 4.14 (WCAG 2.2 AA dan best-practice) di 10 halaman × 4 lebar, ditambah dialog daerah dan menu ponsel: 0 pelanggaran.
- Regresi interaksi `interact.mjs`: 23/23 lulus.
- Detector impeccable di 7 rute (1280 dan 390): yang tersisa hanya `nested-cards` di demo landing (disengaja, lihat audit 002), `overused-font`, dan `cream-palette` (sesuai brief).

## Delivery Gate

- **Block 1 (Hard Gate): semua "tidak".**
  - R-03: 0 overflow di ukuran normal dan di teks 200%.
  - R-17, R-18, R-36, R-38: tidak ada teks, angka, atau klaim baru.
  - R-32: area surat bisa difokus, dan cincin fokus global berlaku.
  - R-39: area klik bertambah tanpa mengubah tampilan.
  - R-40: tidak ada media atau skrip baru.
- **Block 2 (Purpose-Gate):** tidak ada teknik visual baru. Area klik `::after` tidak terlihat.
- **Block 3 (Liveliness):** dial tidak berubah.
- **Block 4 (Craftsmanship): semua "tidak".** Setiap perubahan punya alasan di tabel.

## Batas

- Tidak diuji di Safari, Firefox, perangkat fisik, atau pembaca layar.
- Uji teks 200% hanya menskalakan rem, bukan zoom browser.
- Area klik diukur dengan `elementFromPoint` di Chrome, bukan dengan sentuhan nyata.
- `.impeccable/design.json` lebih tua daripada DESIGN.md. Berkas ini tidak diperbarui di sini; perbarui dengan `/impeccable document` bila perlu.
