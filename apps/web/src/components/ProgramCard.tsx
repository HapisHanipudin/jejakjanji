import Link from 'next/link';
import type { CSSProperties } from 'react';
import { LABEL_PAGU, type ProgramList } from '@jejakjanji/shared';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';
import { Money } from './Money';
import { SourceBox, type SourceDoc } from './SourceBox';
import { STATUS_TEKS } from '@/content/site';
import { namaBidangRingkas, namaProgram } from '@/lib/format';

type Item = ProgramList['data'][number];

/** One program card (Figma JJ/Program card 143:51902): identity, source, three stages, 2026 pagu. */
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
        <SourceBox doc={doc} pages={pages} />
      </div>
      <ul className="program-stages list-plain" aria-label="Jejak bukti">
        {(['rencana', 'anggaran', 'pelaksanaan'] as const).map((stage) => (
          <li key={stage}>
            <span>{STATUS_TEKS[stage].singkat}</span>
            <StatusBadge jenis={stage} status={program.statusBukti[stage]} bare />
          </li>
        ))}
      </ul>
      <div className="program-pagu">
        <p className="program-pagu-year">2026 · Pagu RPJMD</p>
        <p className="program-pagu-value">
          {program.pagu2026 ? (
            <Money jumlah={program.pagu2026.jumlahJutaRp} satuan="juta_rp" />
          ) : (
            <span className="muted">Tidak tercantum</span>
          )}
        </p>
        <p className="program-pagu-label">{LABEL_PAGU}</p>
      </div>
      <span className="link-strong" aria-hidden="true">
        Lihat detail <Icon name="arrow" />
      </span>
    </li>
  );
}
