import Link from 'next/link';
import type { Daerah } from '@jejakjanji/shared';
import { PageHeader } from './PageHeader';
import { KONTAK_KOREKSI } from '@/content/site';

export function RegionEmpty({ region }: { region: Daerah }) {
  return (
    <>
      <PageHeader
        title={`${region.nama} belum dikurasi`}
        lead="Data program dan rujukan dokumen untuk daerah ini belum tersedia di JejakJanji."
      />
      <section className="section container stack">
        <p>
          Belum dikurasi bukan penilaian kinerja pemerintah. Data ditampilkan setelah sumber,
          halaman PDF, dan tanggal pemeriksaannya tercatat.
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" href="/dki-jakarta">
            Lihat DKI Jakarta
          </Link>
          <Link className="btn" href="/metodologi">
            Baca Metodologi
          </Link>
        </div>
        <p className="muted">
          Ingin membantu kurasi? Hubungi <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>.
        </p>
      </section>
    </>
  );
}
