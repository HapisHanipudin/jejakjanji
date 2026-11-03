import { expect, test } from 'vitest';
import {
  formatPersen,
  formatRupiahPenuh,
  formatTanggal,
  namaBidangRingkas,
  namaProgram,
} from './format.ts';
import { totalPagu } from './pagu.ts';

test('angka penuh untuk tooltip', () => {
  expect(formatRupiahPenuh(1322664, 'juta_rp')).toBe('1.322.664 juta rupiah (Rp1.322.664.000.000)');
  expect(formatRupiahPenuh(19550176404217, 'rp')).toBe('Rp19.550.176.404.217');
});

test('tanggal Indonesia', () => {
  expect(formatTanggal('2026-10-22')).toBe('22 Oktober 2026');
});

test('total pagu menjumlah angka per tahun dan memberi label rentang jujur', () => {
  const lima = [2026, 2027, 2028, 2029, 2030].map((tahun) => ({ tahun, jumlahJutaRp: 100 }));
  expect(totalPagu(lima)).toEqual({ jumlahJutaRp: 500, rentang: '2026-2030' });
  expect(totalPagu(lima.filter((r) => r.tahun !== 2028))).toEqual({
    jumlahJutaRp: 400,
    rentang: '4 tahun tersedia (2026, 2027, 2029, 2030)',
  });
  expect(totalPagu([])).toBeNull();
});

test('persen memakai tepat satu desimal', () => {
  expect([22.4, 14.12, 13.68, 0, 100].map(formatPersen)).toEqual([
    '22,4%',
    '14,1%',
    '13,7%',
    '0,0%',
    '100,0%',
  ]);
});

test('nama bidang ringkas hanya membuang awalan formal', () => {
  expect(namaBidangRingkas('Urusan Pemerintahan Bidang Pendidikan')).toBe('Pendidikan');
  expect(namaBidangRingkas('Keuangan')).toBe('Keuangan');
});

test('nama program: buang awalan PROGRAM, ubah kapital, pertahankan akronim', () => {
  expect(namaProgram('PROGRAM PENGELOLAAN PERSAMPAHAN')).toBe('Pengelolaan Persampahan');
  expect(namaProgram('PROGRAM PENYELENGGARAAN LALU LINTAS DAN ANGKUTAN JALAN (LLAJ)')).toBe(
    'Penyelenggaraan Lalu Lintas dan Angkutan Jalan (LLAJ)',
  );
  expect(
    namaProgram(
      'PROGRAM PENCEGAHAN, PENANGGULANGAN, PENYELAMATAN KEBAKARAN DAN PENYELAMATAN NON KEBAKARAN',
    ),
  ).toBe('Pencegahan, Penanggulangan, Penyelamatan Kebakaran dan Penyelamatan Non Kebakaran');
  expect(namaProgram('PROGRAM PENGEMBANGAN UMKM')).toBe('Pengembangan UMKM');
  expect(namaProgram('Program Sudah Rapi')).toBe('Sudah Rapi');
});
