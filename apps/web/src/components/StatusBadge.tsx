import type { NilaiStatus } from '@jejakjanji/shared/status';
import { BELUM_DIKETAHUI, STATUS_TEKS } from '@/content/site';

/** "Rencana: tercantum" (solid border) or "Pelaksanaan: belum diketahui" (dashed, neutral). */
export function StatusBadge({
  jenis,
  status,
}: {
  jenis: keyof typeof STATUS_TEKS;
  status: NilaiStatus;
}) {
  const t = STATUS_TEKS[jenis];
  const ada = status === 'ada';
  return (
    <span className={ada ? 'badge' : 'badge badge-unknown'}>
      {t.singkat}: {ada ? t.ada : BELUM_DIKETAHUI}
    </span>
  );
}
