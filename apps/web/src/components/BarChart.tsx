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
 * `compact`: a real table (year, track, value, optional total row) for the detail page, so screen
 * readers get row and column headers; the track stays as the visual.
 */
export function BarChart({
  bars,
  caption,
  compact = false,
  total,
}: {
  bars: Bar[];
  caption: string;
  compact?: boolean;
  /** Compact only: a footer row, e.g. the multi-year total. */
  total?: { label: ReactNode; display: ReactNode };
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const trackFor = (b: Bar) => (
    <span className="bar-track" aria-hidden="true">
      <span className="bar-fill" style={{ width: `${(b.value / max) * 100}%` }} />
    </span>
  );
  if (compact) {
    return (
      <table className="bar-table" data-reveal="">
        <caption className="sr-only">{caption}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Tahun</th>
            <th scope="col">Proporsi</th>
            <th scope="col">Pagu</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b, i) => (
            <tr key={b.key} style={{ '--i': i } as CSSProperties}>
              <th scope="row" className="bar-label">
                {b.label}
              </th>
              <td>{trackFor(b)}</td>
              <td className="bar-value">{b.display}</td>
            </tr>
          ))}
        </tbody>
        {total && (
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                {total.label}
              </th>
              <td className="bar-value">{total.display}</td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  }
  return (
    <figure style={{ margin: 0 }}>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="bars bars-stacked" data-reveal="">
        {bars.map((b, i) => (
          <li key={b.key} className="bar-row" style={{ '--i': i } as CSSProperties}>
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
            {trackFor(b)}
            {b.source}
          </li>
        ))}
      </ul>
    </figure>
  );
}
