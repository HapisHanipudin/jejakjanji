import { expect, test } from 'vitest';
import { BACKUP_KEY, STORAGE_KEY, bacaSimpanan, simpanSimpanan } from './pelacak-store';

const item = {
  id: 'a1',
  programKode: '2.11.11',
  programNama: 'Program Uji',
  perangkatDaerah: 'Dinas Uji',
  tanggalKirim: '2026-10-22',
  status: 'belum_dijawab',
};
const legacy = JSON.stringify({ versi: 1, permohonan: [item] });
const migrated = {
  ...item,
  daerahKode: '31',
  daerahSlug: 'dki-jakarta',
  daerahNama: 'DKI Jakarta',
};

test('v1 import/migration preserves all fields and assigns Jakarta', () => {
  expect(bacaSimpanan(legacy)).toEqual({ ok: true, data: { versi: 2, permohonan: [migrated] } });
  expect(bacaSimpanan(JSON.stringify({ versi: 2, permohonan: [migrated, migrated] }))).toEqual({
    ok: false,
  });
});

test('failed backup or failed replacement retains exact previous bytes', () => {
  const data = { versi: 2 as const, permohonan: [] };
  for (const failedKey of [BACKUP_KEY, STORAGE_KEY]) {
    const store = new Map([[STORAGE_KEY, legacy]]);
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === failedKey) throw new Error('quota');
        store.set(key, value);
      },
    };
    expect(simpanSimpanan(storage, data)).toBe(false);
    expect(store.get(STORAGE_KEY)).toBe(legacy);
  }
});

test('successful v2 write keeps a recoverable raw v1 backup', () => {
  const store = new Map([[STORAGE_KEY, legacy]]);
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
  const result = bacaSimpanan(legacy);
  if (!result.ok) throw new Error('fixture failed');
  expect(simpanSimpanan(storage, result.data)).toBe(true);
  expect(store.get(BACKUP_KEY)).toBe(legacy);
  expect(bacaSimpanan(store.get(STORAGE_KEY)!)).toEqual(result);
});
