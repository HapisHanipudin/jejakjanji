import { LABEL_PAGU } from '@jejakjanji/shared';

export function ErrorState({
  pesan,
  judul = 'Data belum bisa dimuat',
}: {
  pesan: string;
  judul?: string;
}) {
  return (
    <div className="notice" role="alert">
      <p>
        <strong>{judul}.</strong> {pesan}
      </p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <p>{children}</p>
    </div>
  );
}

/** Required text on every block with spending numbers. Prefer the label sent by the API. */
export function PaguLabel({ label = LABEL_PAGU }: { label?: string }) {
  return <p className="pagu-label">{label}.</p>;
}
