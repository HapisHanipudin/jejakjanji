import type { NilaiStatus, StatusBukti } from '@jejakjanji/shared/status';

/** One step of the evidence trail: solid dot = evidence exists, dashed ring = not known yet. */
export function JejakLangkah({ label, status }: { label: string; status: NilaiStatus }) {
  const ada = status === 'ada';
  return (
    <span className={ada ? 'langkah langkah-ada' : 'langkah'}>
      <img
        src={ada ? '/ikon/penanda-ada.svg' : '/ikon/penanda-belum.png'}
        width={12}
        height={12}
        alt=""
      />
      {label}
      <span className="sr-only">: {ada ? 'ada bukti' : 'belum diketahui'}</span>
    </span>
  );
}

/** Rencana → Anggaran → Bukti, computed from the program's evidence status. */
export function JejakBukti({ status }: { status: StatusBukti }) {
  return (
    <ul className="jejak" aria-label="Jejak bukti">
      <li>
        <JejakLangkah label="Rencana" status={status.rencana} />
      </li>
      <li>
        <JejakLangkah label="Anggaran" status={status.anggaran} />
      </li>
      <li>
        <JejakLangkah label="Bukti" status={status.pelaksanaan} />
      </li>
    </ul>
  );
}
