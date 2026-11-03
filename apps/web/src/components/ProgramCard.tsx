import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ProgramList } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { JejakBukti } from './JejakBukti';
import { Money } from './Money';
import type { SourceDoc } from './SourceBox';
import { namaBidangRingkas, namaProgram } from '@/lib/format';

type Item = ProgramList['data'][number];

/** One program in the list: a table-like row on desktop, a card on narrow screens. */
export function ProgramCard({
  program,
  bidangNama,
  doc,
  regionSlug,
  index = 0,
}: {
  program: Item;
  index?: number;
  regionSlug: string;
  bidangNama: string | undefined;
  doc: SourceDoc | undefined;
}) {
  const pages = [...new Set(program.paguPerTahun.map((p) => p.pageRef))].sort((a, b) => a - b);
  return (
    <li className="program-row" style={{ '--i': Math.min(index, 9) } as CSSProperties}>
      <div>
        <h3>
          <Link
            className="card-link"
            href={`/${regionSlug}/program/${encodeURIComponent(program.kode)}`}
          >
            {namaProgram(program.nama)}
          </Link>
        </h3>
        <p>
          <span className="kode">{program.kode}</span> ·{' '}
          {bidangNama ? namaBidangRingkas(bidangNama) : program.bidangKode}
        </p>
        {pages.length > 0 && (
          <p className="program-ref">
            {doc?.type ?? 'Sumber'} · hal. PDF {pages.join(', ')}
          </p>
        )}
      </div>
      <p className="program-pagu">
        {program.pagu2026 ? (
          <Money jumlah={program.pagu2026.jumlahJutaRp} satuan="juta_rp" />
        ) : (
          <span className="muted small">Tidak tercantum</span>
        )}
        <span className="label-mobile"> · pagu 2026</span>
      </p>
      <JejakBukti status={program.statusBukti} />
      <span className="row-go" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </li>
  );
}
