import type { NilaiStatus } from '@jejakjanji/shared/status';
import { BELUM_DIKETAHUI, STATUS_TEKS } from '@/content/site';
import { Icon } from './Icon';

/** "Rencana: tercantum" (solid border) or "Pelaksanaan: belum diketahui" (dashed, neutral). */
export function StatusBadge({
  jenis,
  status,
  icon = false,
}: {
  jenis: keyof typeof STATUS_TEKS;
  status: NilaiStatus;
  /** Figma badge: a small icon before the text. The text and the dashed outline still carry the meaning. */
  icon?: boolean;
}) {
  const t = STATUS_TEKS[jenis];
  const ada = status === 'ada';
  const cls = [ada ? 'badge' : 'badge badge-unknown', icon ? 'badge-icon' : ''].filter(Boolean);
  return (
    <span className={cls.join(' ')}>
      {icon && <Icon name={ada ? 'file-check' : 'circle-help'} />}
      {t.singkat}: {ada ? t.ada : BELUM_DIKETAHUI}
    </span>
  );
}
