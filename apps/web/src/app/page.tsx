import Link from 'next/link';
import { RegionPicker } from '@/components/RegionPicker';
import { ErrorState } from '@/components/States';
import { getDaerahList } from '@/lib/data';

export default async function LandingPage() {
  const result = await getDaerahList();
  const regions = result.ok ? result.data.data : [];
  const active = regions.filter((region) => region.statusKurasi === 'AKTIF');
  return (
    <>
      <section className="band band-hero landing-hero">
        <div className="container">
          <h1 className="landing-title">
            Telusuri program daerahmu,
            <br className="desktop-only" /> dari rencana sampai bukti.
          </h1>
          <p className="lead">
            Dari dokumen resmi ke informasi yang bisa diperiksa: program, pagu indikatif, dan bukti
            pelaksanaan. Pilih daerah yang ingin Anda telusuri.
          </p>
          <div className="landing-actions">
            <RegionPicker regions={regions} error={result.ok ? undefined : result.pesan} landing />
          </div>
          <p className="small muted">
            Lokasi bersifat opsional. Saran daerah tetap Anda konfirmasi.
          </p>
        </div>
      </section>
      <section className="section-lg section-alt">
        <div className="container stack">
          <h2>Data yang tersedia saat ini</h2>
          {!result.ok ? (
            <ErrorState pesan={result.pesan} />
          ) : active.length ? (
            active.map((region) => (
              <div className="coverage-entry" key={region.kode}>
                <h3>{region.nama}</h3>
                <p>
                  Program prioritas RPJMD dan konteks pagu RKPD dikurasi dengan sumber, halaman PDF,
                  dan tanggal pemeriksaan.
                </p>
                <Link className="btn btn-primary" href={`/${region.slug}`}>
                  Jelajahi {region.nama}
                </Link>
              </div>
            ))
          ) : (
            <p>Belum ada daerah dengan data aktif.</p>
          )}
          <p className="small muted">
            Daerah lain ditambahkan setelah sumber dan datanya diperiksa. Belum dikurasi bukan
            penilaian kinerja pemerintah.
          </p>
        </div>
      </section>
      <section className="section-lg" id="cara-kerja">
        <div className="container">
          <h2 className="section-title">Dari rencana sampai bukti</h2>
          <ol className="grid-3 list-plain landing-steps">
            <li>
              <h3>Baca rencananya</h3>
              <p>Temukan program resmi beserta indikator, target, dan halaman dokumennya.</p>
            </li>
            <li>
              <h3>Pahami pagunya</h3>
              <p>
                Lihat konteks pagu indikatif dengan unit dan sumber yang jelas. Pagu bukan APBD atau
                realisasi.
              </p>
            </li>
            <li>
              <h3>Periksa buktinya</h3>
              <p>
                Bukti belum ditemukan bukan berarti gagal. Susun draf PPID, lalu kirim sendiri bila
                perlu.
              </p>
            </li>
          </ol>
          <Link href="/metodologi" className="btn">
            Baca Metodologi
          </Link>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <h2>Satu daerah, sumber yang bisa ditelusuri.</h2>
          <p>
            Setiap angka memiliki dokumen sumber, halaman PDF, dan tanggal pemeriksaan. Tanpa skor
            kepala daerah, leaderboard, atau perbandingan pagu antar daerah.
          </p>
          <p className="legend-chip">Pagu indikatif, bukan APBD dan bukan realisasi</p>
        </div>
      </section>
    </>
  );
}
