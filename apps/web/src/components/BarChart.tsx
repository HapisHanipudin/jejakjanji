import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

export type Bar = {
  key: string;
  label: ReactNode;
  value: number;
  display: ReactNode;
  href?: string;
  /** Short context revealed on hover/focus (always shown on touch). */
  hint?: string;
};

/** Horizontal bars as plain elements; width is proportional to the largest value. */
export function BarChart({
  bars,
  caption,
  compact = false,
}: {
  bars: Bar[];
  caption: string;
  compact?: boolean;
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className={compact ? 'bars bars-compact' : 'bars'} data-reveal="">
        {bars.map((b, i) => (
          <li key={b.key} className="bar-row" style={{ '--i': i } as CSSProperties}>
            <span className="bar-label">
              {b.href ? (
                <Link href={b.href}>
                  {b.label}
                  {b.hint && (
                    <>
                      <span className="sr-only">, </span>
                      <span className="bar-hint">{b.hint}</span>
                    </>
                  )}
                </Link>
              ) : (
                b.label
              )}
            </span>
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ width: `${(b.value / max) * 100}%` }} />
            </span>
            <span className="bar-value">{b.display}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
