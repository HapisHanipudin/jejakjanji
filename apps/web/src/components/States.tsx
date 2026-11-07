import type { ReactNode } from 'react';
import { LABEL_PAGU } from '@jejakjanji/shared';
import { Icon, type IconName } from './Icon';

/** Inline notice for a section that could not load (Figma JJ/Notice banner 143:51499). */
export function ErrorState({
  pesan,
  judul = 'Data belum bisa dimuat',
}: {
  pesan: string;
  judul?: string;
}) {
  return (
    <div className="notice notice-icon" role="alert">
      <Icon name="info" size={20} />
      <p>
        <strong>{judul}.</strong> {pesan}
      </p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="notice notice-icon">
      <Icon name="info" size={20} />
      <p>{children}</p>
    </div>
  );
}

/**
 * Whole-page state card (Figma "Gagal memuat" 143:48738, "Program tidak ditemukan" 143:48532,
 * "Daerah belum dikurasi" 143:48640, "Pelacak kosong" 143:49226): icon, title, body, actions.
 * `level` 1 when the card is the page's main heading.
 */
export function StatePanel({
  icon,
  title,
  level = 1,
  children,
  actions,
  note,
}: {
  icon: IconName;
  title: ReactNode;
  level?: 1 | 2;
  children: ReactNode;
  actions?: ReactNode;
  note?: ReactNode;
}) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div className="state-panel">
      <Icon name={icon} size={36} />
      <Heading>{title}</Heading>
      <div className="state-panel-body">{children}</div>
      {actions && <div className="btn-row">{actions}</div>}
      {note && <p className="state-panel-note">{note}</p>}
    </div>
  );
}

/** Required text on every block with spending numbers. Prefer the label sent by the API. */
export function PaguLabel({ label = LABEL_PAGU }: { label?: string }) {
  return <span className="chip">{label}</span>;
}
