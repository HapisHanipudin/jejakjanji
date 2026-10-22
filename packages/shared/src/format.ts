const angka = (n: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);

const UNITS: [number, string][] = [
  [1e12, 'T'],
  [1e9, 'M'],
  [1e6, 'juta'],
];

/** Short rupiah with 3 significant digits and Indonesian decimal comma: "Rp1,32 T", "Rp812 M". */
export function formatRupiahRingkas(jumlah: number, satuan: 'juta_rp' | 'rp'): string {
  // Round to 3 significant digits first so 999,96 M rolls over to "Rp1 T" instead of "Rp1.000 M".
  const rp = Number((satuan === 'juta_rp' ? jumlah * 1e6 : jumlah).toPrecision(3));
  const unit = UNITS.find(([base]) => Math.abs(rp) >= base);
  return unit ? `Rp${angka(rp / unit[0])} ${unit[1]}` : `Rp${angka(rp)}`;
}
