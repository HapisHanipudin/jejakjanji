// Dates are 'YYYY-MM-DD' strings handled in UTC so the viewer's timezone never shifts a day.
// ponytail: weekends only, public holidays are not counted; add a holiday list when the team has one.

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const isWeekend = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;

/** The date `n` working days (Mon-Fri) after `iso`. The start day itself is not counted. */
export function tambahHariKerja(iso: string, n: number): string {
  const d = toDate(iso);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!isWeekend(d)) left--;
  }
  return toIso(d);
}

/** Working days from `dari` (exclusive) to `sampai` (inclusive). Negative when `sampai` is earlier. */
export function selisihHariKerja(dari: string, sampai: string): number {
  const a = toDate(dari);
  const b = toDate(sampai);
  const sign = a <= b ? 1 : -1;
  const cur = sign === 1 ? a : b;
  const end = sign === 1 ? b : a;
  let count = 0;
  while (cur < end) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    if (!isWeekend(cur)) count++;
  }
  return sign * count;
}

/** Today in the viewer's local calendar, as 'YYYY-MM-DD'. */
export function hariIni(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
