const tanggalFmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' });

/** '2026-10-22' -> '22 Oktober 2026'. */
export const formatTanggal = (iso: string) => tanggalFmt.format(new Date(`${iso}T00:00:00Z`));

export const formatAngka = (n: number, maxFraction = 0) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: maxFraction }).format(n);

/** Full amount for tooltips: juta_rp -> "1.322.664 juta rupiah (Rp1.322.664.000.000)". */
export function formatRupiahPenuh(jumlah: number, satuan: 'juta_rp' | 'rp'): string {
  return satuan === 'juta_rp'
    ? `${formatAngka(jumlah)} juta rupiah (Rp${formatAngka(jumlah * 1e6)})`
    : `Rp${formatAngka(jumlah)}`;
}

/** Input is a percentage in points, e.g. 22.4, not a fraction. */
export const formatPersen = (n: number) =>
  `${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)}%`;

/** Drop the formal "Urusan Pemerintahan Bidang" prefix for chart labels; other names unchanged. */
export const namaBidangRingkas = (nama: string) =>
  nama.replace(/^Urusan Pemerintahan Bidang\s+/i, '');

// ponytail: acronyms are listed by hand; add one here when a new all-caps program name has one.
const AKRONIM = new Set(['UMKM', 'LLAJ']);
const KATA_SAMBUNG = new Set(['dan', 'atau', 'serta', 'di', 'ke', 'dari', 'untuk', 'yang']);

/**
 * Display name for a program: RPJMD prints names in capitals with a "PROGRAM" prefix. Only the
 * letter case and that prefix change; mixed-case names are returned unchanged apart from the prefix.
 */
export function namaProgram(nama: string): string {
  const tanpaAwalan = nama.replace(/^PROGRAM\s+/i, '');
  if (tanpaAwalan !== tanpaAwalan.toUpperCase()) return tanpaAwalan;
  return tanpaAwalan
    .toLowerCase()
    .split(' ')
    .map((w, i) => {
      const inti = w.replace(/[^\p{L}]/gu, '').toUpperCase();
      if (AKRONIM.has(inti)) return w.toUpperCase();
      if (i > 0 && KATA_SAMBUNG.has(w)) return w;
      return w.replace(/\p{L}/u, (c) => c.toUpperCase());
    })
    .join(' ');
}
