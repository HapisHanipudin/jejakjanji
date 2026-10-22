import { expect, test } from 'vitest';
import { bacaSimpanan } from './pelacak-store.ts';

const item = {
  id: 'a1',
  programKode: '2.11.11',
  programNama: 'Program Uji',
  perangkatDaerah: 'Dinas Uji',
  tanggalKirim: '2026-10-22',
  status: 'belum_dijawab',
};
const valid = { versi: 1, permohonan: [item] };
const dengan = (patch: object) => JSON.stringify({ versi: 1, permohonan: [{ ...item, ...patch }] });

test('kosong bila belum ada simpanan', () => {
  expect(bacaSimpanan(null)).toEqual({ ok: true, data: { versi: 1, permohonan: [] } });
});

test('data valid diterima', () => {
  expect(bacaSimpanan(JSON.stringify(valid))).toEqual({ ok: true, data: valid });
});

test.each([
  ['bukan JSON', '{rusak'],
  ['versi lain', JSON.stringify({ ...valid, versi: 2 })],
  ['bukan objek', '[]'],
  ['status tidak dikenal', dengan({ status: 'gagal' })],
  ['tanggal tidak valid', dengan({ tanggalKirim: '22/10/2026' })],
  ['perangkat daerah terlalu panjang', dengan({ perangkatDaerah: 'x'.repeat(121) })],
  ['field hilang', dengan({ programKode: undefined })],
])('data rusak ditolak: %s', (_, raw) => {
  expect(bacaSimpanan(raw)).toEqual({ ok: false });
});
