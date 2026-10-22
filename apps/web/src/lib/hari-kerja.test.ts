import { expect, test } from 'vitest';
import { selisihHariKerja, tambahHariKerja } from './hari-kerja.ts';

test('melewati akhir pekan', () => {
  // Jumat 2026-10-23 + 1 hari kerja = Senin 2026-10-26.
  expect(tambahHariKerja('2026-10-23', 1)).toBe('2026-10-26');
  // Dikirim hari Sabtu: hari kerja pertama Senin.
  expect(tambahHariKerja('2026-10-24', 1)).toBe('2026-10-26');
});

test('10 hari kerja lintas bulan, lalu perpanjangan 7 hari kerja', () => {
  // Kamis 2026-10-22 + 10 hari kerja = Kamis 2026-11-05.
  expect(tambahHariKerja('2026-10-22', 10)).toBe('2026-11-05');
  // + 7 hari kerja = Senin 2026-11-16.
  expect(tambahHariKerja('2026-11-05', 7)).toBe('2026-11-16');
});

test('lintas tahun', () => {
  // Kamis 2026-12-31 + 2 hari kerja = Senin 2027-01-04.
  expect(tambahHariKerja('2026-12-31', 2)).toBe('2027-01-04');
});

test('selisih hari kerja', () => {
  expect(selisihHariKerja('2026-10-22', '2026-11-05')).toBe(10);
  expect(selisihHariKerja('2026-11-05', '2026-10-22')).toBe(-10);
  expect(selisihHariKerja('2026-10-24', '2026-10-25')).toBe(0);
});
