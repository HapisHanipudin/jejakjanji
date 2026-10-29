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
