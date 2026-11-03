// Calendar maths on 'YYYY-MM-DD' strings in UTC, so the time zone never shifts a date.

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && fmt(parse(v)) === v;

export function geserHari(iso: string, hari: number): string {
  const d = parse(iso);
  d.setUTCDate(d.getUTCDate() + hari);
  return fmt(d);
}

/** Same day in the next/previous month, clamped to that month's last day. */
export function geserBulan(iso: string, bulan: number): string {
  const d = parse(iso);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + bulan, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return fmt(target);
}

/** 0 = Monday … 6 = Sunday (Indonesian calendars start the week on Monday). */
export const hariKe = (iso: string) => (parse(iso).getUTCDay() + 6) % 7;

export const akhirPekan = (iso: string) => hariKe(iso) >= 5;

/** Weeks of the month containing `iso`, Monday first; days outside the month are null. */
export function mingguBulan(iso: string): (string | null)[][] {
  const d = parse(iso);
  const first = fmt(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
  const days = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(hariKe(first)).fill(null);
  for (let i = 0; i < days; i++) cells.push(geserHari(first, i));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
