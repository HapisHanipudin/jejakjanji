import Link from 'next/link';
import type { Daerah } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { StatePanel } from './States';
import { KONTAK_KOREKSI } from '@/content/site';

export function RegionEmpty({ region }: { region: Daerah }) {
  return (
    <div className="section container">
      <StatePanel
        icon="circle-help"
        title={`${region.nama} belum dikurasi`}
        actions={
          <>
            <Link className="btn btn-primary" href="/dki-jakarta">
              Lihat DKI Jakarta
            </Link>
            <Link className="link-strong" href="/metodologi">
              Baca Metodologi <Icon name="arrow" />
            </Link>
          </>
        }
        note={
          <>
            Ingin membantu kurasi? Hubungi <a href={`mailto:${KONTAK_KOREKSI}`}>{KONTAK_KOREKSI}</a>
            .
          </>
        }
      >
        <p>Data program dan rujukan dokumen untuk daerah ini belum tersedia di JejakJanji.</p>
        <p>
          Belum dikurasi menjelaskan cakupan data, bukan penilaian kinerja pemerintah. Data
          ditampilkan setelah sumber, halaman PDF, dan tanggal pemeriksaannya tercatat.
        </p>
      </StatePanel>
    </div>
  );
}
