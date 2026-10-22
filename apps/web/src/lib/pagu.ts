/**
 * Sum of yearly indicative ceilings. The range label comes from the years actually present, so a
 * missing year never hides behind a "2026-2030" heading. Sums per-year values, not the source's
 * total column (which differs by 1-2 million in a few rows because of rounding in the document).
 */
export function totalPagu(rows: { tahun: number; jumlahJutaRp: number }[]) {
  if (rows.length === 0) return null;
  const years = rows.map((r) => r.tahun).sort((a, b) => a - b);
  const first = years[0]!;
  const last = years[years.length - 1]!;
  const contiguous = last - first + 1 === years.length;
  return {
    jumlahJutaRp: rows.reduce((s, r) => s + r.jumlahJutaRp, 0),
    rentang: contiguous
      ? `${first}-${last}`
      : `${years.length} tahun tersedia (${years.join(', ')})`,
  };
}
