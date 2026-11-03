import { expect, test } from 'vitest';
import { akhirPekan, geserBulan, geserHari, hariKe, isIsoDate, mingguBulan } from './kalender.ts';

test('November 2026 dimulai Minggu: enam baris, Senin di kolom pertama', () => {
  const w = mingguBulan('2026-11-15');
  expect(w).toHaveLength(6);
  expect(w[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
  expect(w[5]![0]).toBe('2026-11-30');
  expect(w.flat().filter(Boolean)).toHaveLength(30);
});

test('geser hari dan bulan, termasuk akhir bulan dan tahun', () => {
  expect(geserHari('2026-12-31', 1)).toBe('2027-01-01');
  expect(geserHari('2026-03-01', -1)).toBe('2026-02-28');
  expect(geserBulan('2026-01-31', 1)).toBe('2026-02-28');
  expect(geserBulan('2026-03-31', -1)).toBe('2026-02-28');
  expect(geserBulan('2026-12-15', 1)).toBe('2027-01-15');
});

test('hari dan akhir pekan', () => {
  expect(hariKe('2026-11-02')).toBe(0); // Senin
  expect(akhirPekan('2026-11-07')).toBe(true); // Sabtu
  expect(akhirPekan('2026-11-08')).toBe(true); // Minggu
  expect(akhirPekan('2026-11-06')).toBe(false); // Jumat
});

test('validasi tanggal ISO', () => {
  expect(isIsoDate('2026-11-03')).toBe(true);
  expect(isIsoDate('2026-02-30')).toBe(false);
  expect(isIsoDate('03/11/2026')).toBe(false);
});
