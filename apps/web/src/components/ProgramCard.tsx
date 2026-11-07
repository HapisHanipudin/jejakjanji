import Link from 'next/link';
import type { CSSProperties } from 'react';
import { LABEL_PAGU, type ProgramList } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { JejakBukti } from './JejakBukti';
import { Money } from './Money';
import type { SourceDoc } from './SourceBox';
import { formatTanggal, namaBidangRingkas, namaProgram } from '@/lib/format';

type Item = ProgramList['data'][number];

/** One program card: code, name, field, short source line, evidence trail, 2026 pagu. */
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
      <div className="program-id">
        <p className="kode program-kode">{program.kode}</p>
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
          <p className="source-line">
            <Icon name="file-text" />
            <span>
              {doc?.type ?? 'Sumber'} · hal. PDF {pages.join(', ')}
              {doc && <> · diperiksa {formatTanggal(doc.checkedAt)}</>}
            </span>
          </p>
        )}
      </div>
      <JejakBukti status={program.statusBukti} />
      <div className="program-pagu">
        <p className="program-pagu-value">
          {program.pagu2026 ? (
            <Money jumlah={program.pagu2026.jumlahJutaRp} satuan="juta_rp" />
          ) : (
            <span className="muted">Tidak tercantum</span>
          )}
          <span className="program-pagu-year"> pagu 2026</span>
        </p>
        <p className="program-pagu-label">{LABEL_PAGU}</p>
      </div>
    </li>
  );
}
