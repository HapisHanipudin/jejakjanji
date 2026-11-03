import Link from 'next/link';
import { RegionPicker } from '@/components/RegionPicker';
import { ErrorState } from '@/components/States';
import { getDaerahList, getProgramList } from '@/lib/data';

export default async function LandingPage() {
  const result = await getDaerahList();
  const regions = result.ok ? result.data.data : [];
  const active = regions.filter((region) => region.statusKurasi === 'AKTIF');
  // Each active region's own curated count; never summed or ranked across regions.
  const counts = await Promise.all(
    active.map(async (region) => {
      const list = await getProgramList({ daerah: region.slug });
      return list.ok ? list.data.data.length : null;
    }),
  );
  return (
    <>
      <section className="band band-hero landing-hero">
        <div className="container landing-grid">
          <div>
            <h1 className="landing-title">
              Telusuri program daerahmu,
              <br className="desktop-only" /> dari rencana sampai bukti.
            </h1>
            <p className="lead">
              Dari dokumen resmi ke informasi yang bisa diperiksa: program, pagu indikatif, dan
              bukti pelaksanaan. Pilih daerah yang ingin Anda telusuri.
            </p>
            <div className="landing-actions">
              <RegionPicker
                regions={regions}
                error={result.ok ? undefined : result.pesan}
                landing
              />
            </div>
            <p className="small muted">
              Lokasi bersifat opsional. Saran daerah tetap Anda konfirmasi.
            </p>
          </div>
          <section className="coverage-card" id="cakupan" aria-labelledby="cakupan-title">
            <h2 id="cakupan-title">Data yang tersedia saat ini</h2>
            {!result.ok ? (
              <ErrorState pesan={result.pesan} />
            ) : active.length ? (
              <ul className="list-plain">
                {active.map((region, i) => (
                  <li className="coverage-entry" key={region.kode}>
                    <p className="coverage-name">
                      {region.nama}
                      <span className="badge">Aktif</span>
                    </p>
                    <p className="muted small">
                      {counts[i] != null
                        ? `${counts[i]} program prioritas RPJMD dikurasi`
                        : 'Program prioritas RPJMD dikurasi'}{' '}
                      beserta konteks pagu RKPD, halaman PDF, dan tanggal cek.
                    </p>
                    <Link className="btn btn-primary btn-block" href={`/${region.slug}`}>
                      Jelajahi {region.nama}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Belum ada daerah dengan data aktif.</p>
            )}
            <p className="xsmall muted">
              Daerah lain ditambahkan setelah sumber dan datanya diperiksa. Belum dikurasi bukan
              penilaian kinerja pemerintah.
            </p>
          </section>
        </div>
      </section>
      <section className="section-lg" id="cara-kerja">
        <div className="container">
          <h2 className="section-title">Dari rencana sampai bukti</h2>
          <ol className="grid-3 list-plain landing-steps" data-reveal="">
            <li className="box">
              <h3>Baca rencananya</h3>
              <p>Temukan program resmi beserta indikator, target, dan halaman dokumennya.</p>
            </li>
            <li className="box">
              <h3>Pahami pagunya</h3>
              <p>
                Lihat konteks pagu indikatif dengan unit dan sumber yang jelas. Pagu bukan APBD atau
                realisasi.
              </p>
            </li>
            <li className="box">
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
