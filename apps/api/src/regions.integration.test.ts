import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createApp } from './index';
import {
  daerahListSchema,
  programListSchema,
  programDetailSchema,
  bidangUrusanListSchema,
  sumberListSchema,
} from '@jejakjanji/shared';

// Dedicated disposable local database only; never run fixtures against deployment data.
const url = process.env.TEST_DATABASE_URL;
describe.skipIf(!url)('region isolation in PostgreSQL', () => {
  const client = new Client({ connectionString: url });
  const db = drizzle(client);
  const app = createApp(db);
  const request = (path: string) =>
    app.request(path, {}, { CORS_ORIGINS: 'http://localhost:3000' } as Env);
  beforeAll(async () => {
    const target = new URL(url!);
    if (target.hostname !== '127.0.0.1' || !target.pathname.endsWith('_test')) {
      throw new Error('TEST_DATABASE_URL must point to a dedicated localhost *_test database.');
    }
    await client.connect();
    await migrate(db, { migrationsFolder: './drizzle' });
  });
  beforeEach(async () => {
    await client.query('BEGIN');
    await client.query(`
      DELETE FROM evidence;
      DELETE FROM funding;
      DELETE FROM program;
      DELETE FROM bidang_urusan;
      DELETE FROM source_document;
      DELETE FROM daerah WHERE kode <> '31';
      INSERT INTO daerah (kode,slug,nama,tingkat,status_kurasi) VALUES
        ('TEST-A','test-a','Test fixture A','PROVINSI','AKTIF'),
        ('TEST-B','test-b','Test fixture B','PROVINSI','AKTIF'),
        ('TEST-C','test-c','Test fixture C','PROVINSI','BELUM_DIKURASI');
      INSERT INTO source_document (daerah_kode,title,type,version,checked_at)
        SELECT kode,nama,'RPJMD','fixture','2026-11-03' FROM daerah WHERE kode IN ('TEST-A','TEST-B');
      INSERT INTO bidang_urusan (daerah_kode,kode,nama,pagu_indikatif_2026,proporsi,source_document_id,page_ref)
        SELECT daerah_kode,'2.11','Fixture',100,1,id,1 FROM source_document;
      INSERT INTO program (daerah_kode,kode,nama,bidang_kode,indikator,satuan,kondisi_awal,target_2026,source_document_id,page_ref)
        SELECT daerah_kode,'2.11.11',title,'2.11','fixture','fixture','0','1',id,1 FROM source_document;
      INSERT INTO funding (daerah_kode,program_kode,tahun,jenis,jumlah_juta_rp,source_document_id,page_ref)
        SELECT daerah_kode,'2.11.11',2026,'INDIKATIF_RPJMD',CASE WHEN daerah_kode='TEST-A' THEN 11 ELSE 22 END,id,1 FROM source_document;
    `);
  });
  afterEach(async () => {
    await client.query('ROLLBACK');
  });
  afterAll(async () => {
    await client.end();
  });

  it('keeps identical codes and funding isolated, accepts slug and code', async () => {
    for (const [region, name, amount] of [
      ['test-a', 'Test fixture A', 11],
      ['TEST-B', 'Test fixture B', 22],
    ] as const) {
      const response = await request(`/api/program?daerah=${region}`);
      expect(response.status).toBe(200);
      const body = programListSchema.parse(await response.json());
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.nama).toBe(name);
      expect(body.data[0]?.pagu2026?.jumlahJutaRp).toBe(amount);
      const detail = await request(`/api/daerah/${region}/program/2.11.11`);
      expect(programDetailSchema.parse(await detail.json()).data?.pagu[0]?.jumlahJutaRp).toBe(
        amount,
      );
      const sources = sumberListSchema.parse(
        await (await request(`/api/sumber?daerah=${region}`)).json(),
      );
      const fields = bidangUrusanListSchema.parse(
        await (await request(`/api/bidang-urusan?daerah=${region}`)).json(),
      );
      expect(sources.data).toHaveLength(1);
      expect(sources.data[0]?.title).toBe(name);
      expect(fields.data).toHaveLength(1);
      expect(fields.data[0]?.sourceDocumentId).toBe(sources.data[0]?.id);
      expect(body.data[0]?.pagu2026?.sourceDocumentId).toBe(sources.data[0]?.id);
    }
    const legacy = await request('/api/program');
    expect(programListSchema.parse(await legacy.json()).daerah?.kode).toBe('31');
    expect((await request('/api/program/2.11.11')).status).toBe(404);
  });

  it('distinguishes missing regions, uncurated regions, and missing programs', async () => {
    expect((await request('/api/program?daerah=missing')).status).toBe(404);
    expect((await request('/api/daerah/test-a/program/missing')).status).toBe(404);
    for (const endpoint of ['program', 'bidang-urusan', 'sumber']) {
      const response = await request(`/api/${endpoint}?daerah=test-c`);
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        daerah: { statusKurasi: 'BELUM_DIKURASI' },
        data: [],
      });
    }
    expect(await (await request('/api/daerah/test-c/program/2.11.11')).json()).toMatchObject({
      data: null,
    });
    expect(daerahListSchema.parse(await (await request('/api/daerah')).json()).data).toHaveLength(
      4,
    );
  });

  it('rejects a cross-region document foreign key', async () => {
    const result = await client.query("SELECT id FROM source_document WHERE daerah_kode='TEST-B'");
    await expect(
      client.query("UPDATE program SET source_document_id=$1 WHERE daerah_kode='TEST-A'", [
        result.rows[0].id,
      ]),
    ).rejects.toMatchObject({ code: '23503' });
  });
});
