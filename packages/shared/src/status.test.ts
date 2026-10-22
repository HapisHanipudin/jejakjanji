import { expect, test } from 'vitest';
import { hitungStatusBukti } from './status.ts';

test('tanpa evidence semua belum_diketahui', () => {
  expect(hitungStatusBukti([])).toEqual({
    rencana: 'belum_diketahui',
    anggaran: 'belum_diketahui',
    pelaksanaan: 'belum_diketahui',
  });
});

test('evidence bersumber menjadi ada; pencarian tanpa sumber tetap belum_diketahui', () => {
  expect(
    hitungStatusBukti([
      { jenis: 'RENCANA', sourceDocumentId: 1 },
      { jenis: 'PELAKSANAAN', sourceDocumentId: null },
    ]),
  ).toEqual({ rencana: 'ada', anggaran: 'belum_diketahui', pelaksanaan: 'belum_diketahui' });
});
