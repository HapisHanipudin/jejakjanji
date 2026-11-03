import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { and, asc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import {
  LABEL_PAGU,
  JAKARTA,
  daerah,
  bidangUrusan,
  evidence,
  funding,
  hitungStatusBukti,
  program,
  programQuerySchema,
  sourceDocument,
  type ApiError,
  type BidangUrusanList,
  type ProgramDetail,
  type ProgramList,
  type SumberList,
} from '@jejakjanji/shared';

type App = { Bindings: Env; Variables: { db: NodePgDatabase } };

export function createApp(database?: NodePgDatabase) {
  const app = new Hono<App>();

  const fail = (status: 400 | 404 | 500, kode: string, pesan: string, detail?: unknown) =>
    new HTTPException(status, {
      res: Response.json({ error: { kode, pesan, detail } } satisfies ApiError, { status }),
    });

  const byKode = (a: { kode: string }, b: { kode: string }) =>
    a.kode.localeCompare(b.kode, 'en', { numeric: true });

  app.use('*', (c, next) =>
    cors({ origin: c.env.CORS_ORIGINS.split(',').map((o) => o.trim()) })(c, next),
  );

  // Hyperdrive pools connections itself, so a fresh pg Client per request is the documented pattern.
  app.use('/api/*', async (c, next) => {
    if (database) {
      c.set('db', database);
      return next();
    }
    const client = new Client({ connectionString: c.env.HYPERDRIVE.connectionString });
    await client.connect();
    c.set('db', drizzle(client));
    try {
      await next();
    } finally {
      c.executionCtx.waitUntil(client.end());
    }
  });

  async function resolveRegion(c: Context<App>, input?: string) {
    const value = input ?? JAKARTA.kode;
    const [region] = await c.var.db
      .select()
      .from(daerah)
      .where(or(eq(daerah.kode, value), eq(daerah.slug, value)))
      .limit(1);
    if (!region)
      throw fail(
        404,
        'DAERAH_TIDAK_DITEMUKAN',
        'Daerah tidak ditemukan. Pilih daerah dari daftar yang tersedia.',
      );
    return region;
  }

  app.get('/api/daerah', async (c) => {
    const rows = await c.var.db
      .select({
        kode: daerah.kode,
        slug: daerah.slug,
        nama: daerah.nama,
        tingkat: daerah.tingkat,
        statusKurasi: daerah.statusKurasi,
        ppidUrl: daerah.ppidUrl,
      })
      .from(daerah)
      .orderBy(asc(daerah.nama));
    return c.json({ data: rows });
  });

  app.get('/api/bidang-urusan', async (c) => {
    const region = await resolveRegion(c, c.req.query('daerah'));
    if (region.statusKurasi === 'BELUM_DIKURASI')
      return c.json({ label: LABEL_PAGU, daerah: region, data: [] });
    const rows = await c.var.db
      .select()
      .from(bidangUrusan)
      .where(eq(bidangUrusan.daerahKode, region.kode));
    return c.json({
      label: LABEL_PAGU,
      daerah: region,
      data: rows.sort(byKode),
    } satisfies BidangUrusanList);
  });

  app.get('/api/program', async (c) => {
    const parsed = programQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      throw fail(400, 'QUERY_TIDAK_VALID', 'Parameter query tidak valid.', parsed.error.issues);
    }
    const { bidang, status, q } = parsed.data;
    const region = await resolveRegion(c, parsed.data.daerah);
    if (region.statusKurasi === 'BELUM_DIKURASI')
      return c.json({ label: LABEL_PAGU, daerah: region, data: [] });
    const db = c.var.db;

    const filters: (SQL | undefined)[] = [eq(program.daerahKode, region.kode)];
    if (bidang) filters.push(eq(program.bidangKode, bidang));
    if (q) {
      const like = q.replace(/[\\%_]/g, '\\$&');
      filters.push(or(ilike(program.nama, `%${like}%`), ilike(program.kode, `${like}%`)));
    }

    const rows = await db
      .select({
        kode: program.kode,
        nama: program.nama,
        bidangKode: program.bidangKode,
        jumlahJutaRp: funding.jumlahJutaRp,
        sourceDocumentId: funding.sourceDocumentId,
        pageRef: funding.pageRef,
      })
      .from(program)
      .leftJoin(
        funding,
        and(
          eq(funding.programKode, program.kode),
          eq(funding.daerahKode, program.daerahKode),
          eq(funding.tahun, 2026),
          eq(funding.jenis, 'INDIKATIF_RPJMD'),
        ),
      )
      .where(and(...filters));

    const kodes = rows.map((r) => r.kode);
    const [ev, paguRows] = kodes.length
      ? await Promise.all([
          db
            .select({
              programKode: evidence.programKode,
              jenis: evidence.jenis,
              sourceDocumentId: evidence.sourceDocumentId,
            })
            .from(evidence)
            .where(and(eq(evidence.daerahKode, region.kode), inArray(evidence.programKode, kodes))),
          db
            .select({
              programKode: funding.programKode,
              tahun: funding.tahun,
              jumlahJutaRp: funding.jumlahJutaRp,
              sourceDocumentId: funding.sourceDocumentId,
              pageRef: funding.pageRef,
            })
            .from(funding)
            .where(
              and(
                eq(funding.daerahKode, region.kode),
                inArray(funding.programKode, kodes),
                eq(funding.jenis, 'INDIKATIF_RPJMD'),
              ),
            )
            .orderBy(asc(funding.tahun)),
        ])
      : [[], []];

    // ponytail: status filter runs in JS so hitungStatusBukti stays the single rule; move to SQL if program count grows large.
    const data = rows
      .map(({ jumlahJutaRp, sourceDocumentId, pageRef, ...p }) => ({
        ...p,
        pagu2026:
          jumlahJutaRp == null || sourceDocumentId == null || pageRef == null
            ? null
            : { jumlahJutaRp, sourceDocumentId, pageRef },
        paguPerTahun: paguRows
          .filter((f) => f.programKode === p.kode)
          .map(({ programKode: _, ...f }) => f),
        statusBukti: hitungStatusBukti(ev.filter((e) => e.programKode === p.kode)),
      }))
      .filter((p) => !status || p.statusBukti.pelaksanaan === status)
      .sort(byKode);

    return c.json({ label: LABEL_PAGU, daerah: region, data } satisfies ProgramList);
  });

  async function detail(c: Context<App>, regionInput: string) {
    const region = await resolveRegion(c, regionInput);
    if (region.statusKurasi === 'BELUM_DIKURASI')
      return c.json({ label: LABEL_PAGU, daerah: region, data: null });
    const kode = c.req.param('kode');
    if (!kode) throw fail(400, 'QUERY_TIDAK_VALID', 'Kode program wajib diisi.');
    const db = c.var.db;

    const [row] = await db
      .select({ program, sumber: sourceDocument })
      .from(program)
      .innerJoin(
        sourceDocument,
        and(
          eq(program.sourceDocumentId, sourceDocument.id),
          eq(program.daerahKode, sourceDocument.daerahKode),
        ),
      )
      .where(and(eq(program.daerahKode, region.kode), eq(program.kode, kode)));
    if (!row)
      throw fail(404, 'PROGRAM_TIDAK_DITEMUKAN', `Program dengan kode "${kode}" tidak ditemukan.`);

    const [pagu, ev] = await Promise.all([
      db
        .select({
          tahun: funding.tahun,
          jenis: funding.jenis,
          jumlahJutaRp: funding.jumlahJutaRp,
          sourceDocumentId: funding.sourceDocumentId,
          pageRef: funding.pageRef,
        })
        .from(funding)
        .where(and(eq(funding.daerahKode, region.kode), eq(funding.programKode, kode)))
        .orderBy(asc(funding.tahun)),
      db
        .select()
        .from(evidence)
        .where(and(eq(evidence.daerahKode, region.kode), eq(evidence.programKode, kode)))
        .orderBy(asc(evidence.id)),
    ]);

    const { sourceDocumentId: _, ...p } = row.program;
    return c.json({
      label: LABEL_PAGU,
      daerah: region,
      data: {
        ...p,
        sumber: row.sumber,
        pagu,
        evidence: ev.map(({ programKode: _, ...e }) => e),
        statusBukti: hitungStatusBukti(ev),
      },
    } satisfies ProgramDetail);
  }
  app.get('/api/program/:kode', (c) => detail(c, JAKARTA.kode));
  app.get('/api/daerah/:daerah/program/:kode', (c) => detail(c, c.req.param('daerah')));

  app.get('/api/sumber', async (c) => {
    const region = await resolveRegion(c, c.req.query('daerah'));
    if (region.statusKurasi === 'BELUM_DIKURASI') return c.json({ daerah: region, data: [] });
    const data = await c.var.db
      .select()
      .from(sourceDocument)
      .where(eq(sourceDocument.daerahKode, region.kode))
      .orderBy(asc(sourceDocument.id));
    return c.json({ daerah: region, data } satisfies SumberList);
  });

  app.notFound(() => fail(404, 'TIDAK_DITEMUKAN', 'Endpoint tidak ditemukan.').getResponse());

  app.onError((err) => {
    if (err instanceof HTTPException) return err.getResponse();
    console.error(err);
    return fail(500, 'KESALAHAN_SERVER', 'Terjadi kesalahan pada server.').getResponse();
  });

  return app;
}

export default createApp();
