import { expect, test } from 'vitest';
import { formatRupiahRingkas } from './format.ts';

test.each([
  [1322664, 'juta_rp', 'Rp1,32 T'],
  [19550176404217, 'rp', 'Rp19,6 T'],
  [396, 'juta_rp', 'Rp396 juta'],
  [812_000, 'juta_rp', 'Rp812 M'],
  [999_960, 'juta_rp', 'Rp1 T'],
  [1_500_000_000, 'rp', 'Rp1,5 M'],
  [0, 'rp', 'Rp0'],
] as const)('%d %s -> %s', (jumlah, satuan, hasil) => {
  expect(formatRupiahRingkas(jumlah, satuan)).toBe(hasil);
});
