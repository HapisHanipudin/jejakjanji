import Link from 'next/link';
import type { ProgramList } from '@jejakjanji/shared';
import { Money } from './Money';
import { SourceBox, type SourceDoc } from './SourceBox';
import { StatusBadge } from './StatusBadge';
import { PaguLabel } from './States';
import { totalPagu } from '@/lib/pagu';

type Item = ProgramList['data'][number];

export function ProgramCard({
  program,
  bidangNama,
  doc,
  label,
}: {
  program: Item;
  bidangNama: string | undefined;
  doc: SourceDoc | undefined;
  label: string;
}) {
  const total = totalPagu(program.paguPerTahun);
  const pages = program.paguPerTahun.map((p) => p.pageRef);
  return (
    <article className="card">
      <p className="small muted">
        <span className="kode">{program.kode}</span> | {bidangNama ?? program.bidangKode}
      </p>
      <h3>
        <Link className="card-link" href={`/program/${encodeURIComponent(program.kode)}`}>
          {program.nama}
        </Link>
      </h3>
      <p>
        Pagu indikatif 2026:{' '}
        {program.pagu2026 ? (
          <Money jumlah={program.pagu2026.jumlahJutaRp} satuan="juta_rp" />
        ) : (
          'tidak tercantum'
        )}
      </p>
      {total && (
        <p>
          Total {total.rentang}: <Money jumlah={total.jumlahJutaRp} satuan="juta_rp" />
        </p>
      )}
      <div className="badge-row">
        <StatusBadge jenis="rencana" status={program.statusBukti.rencana} />
        <StatusBadge jenis="pelaksanaan" status={program.statusBukti.pelaksanaan} />
      </div>
      <PaguLabel label={label} />
      {pages.length > 0 && <SourceBox doc={doc} pages={pages} />}
    </article>
  );
}
