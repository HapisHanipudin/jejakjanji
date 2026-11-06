import type { NilaiStatus } from '@jejakjanji/shared/status';
import { BELUM_DIKETAHUI, STATUS_TEKS } from '@/content/site';
import { Icon } from './Icon';

const kapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "Rencana: tercantum" (solid border, file icon) or "Pelaksanaan: belum diketahui" (dashed border,
 * question icon, neutral). `bare` drops the stage name when a visible row label already names it.
 */
export function StatusBadge({
  jenis,
  status,
  bare = false,
}: {
  jenis: keyof typeof STATUS_TEKS;
  status: NilaiStatus;
  bare?: boolean;
}) {
  const t = STATUS_TEKS[jenis];
  const ada = status === 'ada';
  const nilai = ada ? t.ada : BELUM_DIKETAHUI;
  return (
    <span className={ada ? 'badge' : 'badge badge-unknown'}>
      <Icon name={ada ? 'file-check' : 'circle-help'} />
      {bare ? kapital(nilai) : `${t.singkat}: ${nilai}`}
    </span>
  );
}
