import Link from 'next/link';
import type { ReactNode } from 'react';

export type Bar = {
  key: string;
  label: ReactNode;
  value: number;
  display: ReactNode;
  href?: string;
};

/** Horizontal bars as plain elements; width is proportional to the largest value. */
export function BarChart({ bars, caption }: { bars: Bar[]; caption: string }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="bars">
        {bars.map((b) => (
          <li key={b.key} className="bar-row">
            <span>{b.href ? <Link href={b.href}>{b.label}</Link> : b.label}</span>
            <span className="bar-track" aria-hidden="true">
              <span
                className="bar-fill"
                style={{ display: 'block', width: `${(b.value / max) * 100}%` }}
              />
            </span>
            <span>{b.display}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
