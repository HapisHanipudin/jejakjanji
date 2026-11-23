// Turns the first sheet of an Excel file into the CSV text the import already validates, so
// Excel and CSV share one rule set. Runs in the browser; the server only ever sees CSV.

/** The parts of a SheetJS cell this converter reads. */
export type Sel = { t: string; v?: unknown; z?: string | number; w?: string } | undefined;

/**
 * Numbers are written the way the CSV rules expect: integers as plain digits, decimals with a
 * comma. A cell formatted as a percentage holds a fraction (0.2239 shows as 22,39%), so it is
 * scaled back to the number people see; otherwise 22,39% would import as 0,2239.
 */
export function angkaKeTeks(v: number, format?: string | number) {
  const persen = typeof format === 'string' && format.includes('%');
  // Rounding removes float noise such as 22.389999999999997 from the percent scaling.
  const n = Number((persen ? v * 100 : v).toPrecision(15));
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
}

export function selKeTeks(sel: Sel): string {
  if (!sel) return '';
  switch (sel.t) {
    case 'n':
      return angkaKeTeks(sel.v as number, sel.z);
    case 's':
      return String(sel.v ?? '');
    case 'b':
      return sel.v ? 'TRUE' : 'FALSE';
    case 'z':
      return '';
    default:
      // Errors (#N/A) and dates are not valid in any import column; pass the shown text so the
      // validator names the cell instead of importing a guess.
      return sel.w ?? String(sel.v ?? '');
  }
}

const kolomCsv = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);

/** Rows are padded to the widest row: the CSV parser rejects ragged records. */
export function barisKeCsv(baris: Sel[][]) {
  const lebar = Math.max(0, ...baris.map((b) => b.length));
  return baris
    .map((sel) => Array.from({ length: lebar }, (_, i) => kolomCsv(selKeTeks(sel[i]))).join(','))
    .join('\n');
}

/** Reads the first sheet. SheetJS loads only when an Excel file is chosen. */
export async function excelKeCsv(file: File) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellNF: true });
  const nama = wb.SheetNames[0];
  const ws = nama ? wb.Sheets[nama] : undefined;
  if (!nama || !ws?.['!ref']) throw new Error('Lembar pertama berkas Excel kosong.');
  const r = XLSX.utils.decode_range(ws['!ref']);
  const baris: Sel[][] = [];
  for (let row = r.s.r; row <= r.e.r; row++) {
    const sel: Sel[] = [];
    for (let col = r.s.c; col <= r.e.c; col++)
      sel.push(ws[XLSX.utils.encode_cell({ r: row, c: col })] as Sel);
    baris.push(sel);
  }
  return { lembar: nama, csv: barisKeCsv(baris) };
}
