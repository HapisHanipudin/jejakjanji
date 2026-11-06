import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { ProgramList } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { JejakBukti } from './JejakBukti';
import { Money } from './Money';
import type { SourceDoc } from './SourceBox';
import { PaguLabel } from './States';
import { formatTanggal, namaBidangRingkas, namaProgram } from '@/lib/format';

type Item = ProgramList['data'][number];

/** One program in the list: a card (code, name, field, source, trail, 2026 pagu with its label). */
export function ProgramCard({
  program,
  bidangNama,
  doc,
  regionSlug,
  paguLabel,
  index = 0,
}: {
  program: Item;
  index?: number;
  regionSlug: string;
  bidangNama: string | undefined;
  doc: SourceDoc | undefined;
  /** The API's own pagu label, shown beside the amount. */
  paguLabel?: string;
}) {
  const pages = [...new Set(program.paguPerTahun.map((p) => p.pageRef))].sort((a, b) => a - b);
  return (
    <li className="program-row" style={{ '--i': Math.min(index, 9) } as CSSProperties}>
      <div className="program-main">
        <p className="program-code">
          <span className="kode">{program.kode}</span>
        </p>
        <h3>
          <Link
            className="card-link"
            href={`/${regionSlug}/program/${encodeURIComponent(program.kode)}`}
          >
            {namaProgram(program.nama)}
          </Link>
        </h3>
        <p className="program-bidang">
          {bidangNama ? namaBidangRingkas(bidangNama) : program.bidangKode}
        </p>
        {pages.length > 0 && (
          <p className="program-ref source-line">
            <Icon name="file-text" />
            <span>
              {doc?.type ?? 'Sumber'} · hal. PDF {pages.join(', ')}
              {doc ? <> · diperiksa {formatTanggal(doc.checkedAt)}</> : null}
            </span>
          </p>
        )}
      </div>
      <JejakBukti status={program.statusBukti} />
      <div className="program-money">
        <p className="program-pagu">
          {program.pagu2026 ? (
            <Money jumlah={program.pagu2026.jumlahJutaRp} satuan="juta_rp" />
          ) : (
            <span className="muted small">Tidak tercantum</span>
          )}
          <span className="label-mobile"> · pagu 2026</span>
        </p>
        {program.pagu2026 && paguLabel && <PaguLabel plain label={paguLabel} />}
      </div>
      <span className="row-go" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </li>
  );
}
