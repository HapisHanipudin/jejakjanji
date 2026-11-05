import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export type Bar = {
  key: string;
  label: ReactNode;
  value: number;
  display: ReactNode;
  href?: string;
  /** Short context under the label, e.g. how many curated programs sit behind the field. */
  hint?: string;
  /** Source line for this row (stacked layout only). */
  source?: ReactNode;
};

/**
 * Horizontal bars as plain elements; width is proportional to the largest value.
 * Default: stacked rows (Figma JJ/Budget bar row 143:51904) with label, value, 12px track, source.
 * `compact`: one-line rows (year, track, value) for the per-year table on the detail page.
 */
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
      <ul className={compact ? 'bars bars-compact' : 'bars bars-stacked'} data-reveal="">
        {bars.map((b, i) => {
          const track = (
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ width: `${(b.value / max) * 100}%` }} />
            </span>
          );
          return (
            <li key={b.key} className="bar-row" style={{ '--i': i } as CSSProperties}>
              {compact ? (
                <>
                  <span className="bar-label">{b.label}</span>
                  {track}
                  <span className="bar-value">{b.display}</span>
                </>
              ) : (
                <>
                  <span className="bar-head">
                    <span className="bar-label">
                      {b.href ? <Link href={b.href}>{b.label}</Link> : b.label}
                      {b.hint && (
                        <>
                          <span className="sr-only">, </span>
                          <span className="bar-hint">{b.hint}</span>
                        </>
                      )}
                    </span>
                    {b.href && <Icon name="arrow-up-right" size={20} />}
                  </span>
                  <span className="bar-value">{b.display}</span>
                  {track}
                  {b.source}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
