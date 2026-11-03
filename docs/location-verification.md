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
dan pesan kegagalan tiap tahap.

## Setelah deployment

Commit aplikasi `f75a363` dipush pada `feat/multi-daerah-local`.
[Build Linux](https://github.com/HapisHanipudin/jejakjanji/actions/runs/41602803610)
lulus, kemudian preview diperbarui ke versi Worker
`4dac075e-7b33-4e8c-8fa9-936eb63ae53c`:
https://jejakjanji-web-preview.hapishanipudin.workers.dev/.

Firefox 159.0 diuji ulang pada domain HTTPS tersebut dengan GPS dan layanan
tiruan di profil browser terpisah. Hasil lulus: tidak memanggil GPS/penyedia
sebelum persetujuan; menerima `coordinates`; menunggu konfirmasi sebelum
berpindah; menangani kode perangkat 1/2/3, kegagalan jaringan dan HTTP, payload
rusak, serta hasil daerah yang belum tersedia; menolak IP fallback; dan tidak
mengirim request penyedia setelah dialog dibatalkan saat menunggu koordinat.

Ini uji browser Firefox nyata dengan respons layanan yang disimulasikan,
bukan pembacaan GPS perangkat pengguna atau request BigDataCloud nyata.
Pengguna sudah diminta memuat ulang preview dan mencoba GPS kembali. Hasil
GPS perangkat fisik belum dikonfirmasi pada saat laporan ini ditulis.
