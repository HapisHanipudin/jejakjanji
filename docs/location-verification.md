# Perbaikan lokasi setelah uji pengguna — 3 November 2026

Pengguna melaporkan gagal di Mozilla Firefox setelah memberikan izin lokasi.
Pesan yang terlihat: “Lokasi belum ditemukan atau layanan gagal.” Pesan lama
tidak membedakan kegagalan perangkat, koneksi penyedia, atau validasi respons.

## Bug yang terbukti

Validator JejakJanji meminta `lookupSource: reverseGeocoding`. Nilai itu bukan
kontrak yang dipublikasikan penyedia. [SDK React resmi BigDataCloud](https://github.com/bigdatacloudapi/react-reverse-geocode-client#response-data)
mendefinisikan `coordinates` untuk hasil koordinat dan `ipGeolocation` untuk
hasil IP. Validator diperbaiki agar menerima `coordinates`, tetap menolak IP
fallback dan nilai sumber yang tidak dikenal.

Mock tes sebelumnya juga memakai nilai yang keliru, sehingga hasil tes lama
tidak membuktikan kompatibilitas respons penyedia sebenarnya. Fixture diperbaiki
berdasarkan kontrak resmi: tes gagal pada validator lama, kemudian lulus setelah
perbaikan. Tidak dilakukan request server-side atau pengiriman koordinat contoh
ke endpoint client BigDataCloud.

Firefox 159.0 dalam profil uji terpisah berhasil mereproduksi pesan yang sama
pada preview sebelum perbaikan: GPS tiruan mengembalikan koordinat, respons
penyedia tiruan memakai `coordinates`, dan validator menolaknya. Ini membuktikan
bug yang dapat menyebabkan laporan tersebut; bukan bukti bahwa layanan lokasi
perangkat pengguna pasti berfungsi.

## Perubahan

- Koreksi satu nilai kontrak respons; pemetaan wilayah tetap hanya Jakarta.
- Pesan terpisah untuk izin ditolak, koordinat tidak tersedia, timeout perangkat,
  layanan tidak dapat dihubungi/menolak request, dan respons yang tidak terbaca.
- Tidak mencatat koordinat atau payload penyedia dalam pesan error/log.
- Tetap membutuhkan persetujuan pengguna dan konfirmasi saran. Tidak ada
  fallback IP, redirect otomatis, dependency baru, atau perubahan database/API.

Typecheck, lint, dan 40 tes termasuk integrasi PostgreSQL lulus. Regresi
mencakup kontrak `coordinates`, penolakan sumber IP/nilai lama/field hilang,
dan pesan kegagalan tiap tahap. Verifikasi Firefox setelah deployment dicatat
setelah selesai; GPS perangkat fisik tetap memerlukan uji ulang pengguna.
