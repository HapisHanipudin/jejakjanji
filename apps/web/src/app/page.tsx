import Link from 'next/link';
import { FlowDemo } from '@/components/FlowDemo';
import { Icon } from '@/components/Icon';
import { RegionPicker } from '@/components/RegionPicker';
import { ErrorState } from '@/components/States';
import { getDaerahList, getProgram, getProgramList } from '@/lib/data';

export default async function LandingPage() {
  const result = await getDaerahList();
  const regions = result.ok ? result.data.data : [];
  const active = regions.filter((region) => region.statusKurasi === 'AKTIF');
  // Each active region's own curated count; never summed or ranked across regions.
  const lists = await Promise.all(
    active.map(async (region) => {
      const list = await getProgramList({ daerah: region.slug });
      return list.ok ? list.data.data : null;
    }),
  );
  const counts = lists.map((list) => list?.length ?? null);
  const jakartaIndex = active.findIndex((region) => region.kode === '31');
  const candidates = lists[jakartaIndex] ?? [];
  const examples = await Promise.all(
    [...candidates]
      .sort((a, b) => Number(b.kode === '2.11.11') - Number(a.kode === '2.11.11'))
      .slice(0, 2)
      .map((program) => getProgram(program.kode, 'dki-jakarta')),
  );
  const demoPrograms = examples.flatMap((result) =>
    result.ok && result.data.data ? [result.data.data] : [],
  );
  return (
    <div className="landing-page">
      <section className="band band-hero landing-hero">
        <div className="container landing-grid">
          <div>
            <h1 className="landing-title">Telusuri program daerahmu, dari rencana sampai bukti</h1>
            <p className="lead">
              Periksa program prioritas, pagu indikatif, dan bukti pelaksanaan dari dokumen resmi.
            </p>
            <div className="landing-actions">
              <RegionPicker
                regions={regions}
                error={result.ok ? undefined : result.pesan}
                landing
              />
            </div>
            <p className="small muted">
              Pilih daerah secara manual, atau gunakan lokasi dengan persetujuan Anda.
            </p>
          </div>
          <section className="coverage-card" id="cakupan" aria-labelledby="cakupan-title">
            <span className="hero-card-icon" aria-hidden="true">
              <Icon name="files" size={40} />
            </span>
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
          <FlowDemo programs={demoPrograms} />
          <Link href="/metodologi" className="btn">
            Baca Metodologi
          </Link>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <h2>Satu daerah, sumber yang bisa ditelusuri</h2>
          <p>
            Setiap angka memiliki dokumen sumber, halaman PDF, dan tanggal pemeriksaan. Tanpa skor
            kepala daerah, leaderboard, atau perbandingan pagu antar daerah.
          </p>
          <p className="legend-chip">Pagu indikatif, bukan APBD dan bukan realisasi</p>
        </div>
      </section>
    </div>
  );
}
