import type { Context, Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { csrf } from 'hono/csrf';
import type { HTTPException } from 'hono/http-exception';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { z } from 'zod';
import {
  daerah,
  evidence,
  evidenceBodySchema,
  imporBodySchema,
  program,
  sourceDocument,
  sumberBodySchema,
  verifiedBodySchema,
} from '@jejakjanji/shared';
import {
  ImporError,
  parseBidang,
  parseProgram,
  simpanBidang,
  simpanProgram,
  type Tx,
} from '@jejakjanji/shared/impor';
import { createAuth } from './auth.ts';

export type AdminEnv = Env & { BETTER_AUTH_SECRET?: string; BETTER_AUTH_URL?: string };
type App = { Bindings: AdminEnv; Variables: { db: NodePgDatabase } };
type Fail = (
  status: 400 | 401 | 403 | 404 | 409 | 413 | 500,
  kode: string,
  pesan: string,
  detail?: unknown,
) => HTTPException;

const origins = (c: Context<App>) => c.env.CORS_ORIGINS.split(',').map((o) => o.trim());

/** Thrown inside a transaction to roll back a "periksa saja" import. */
class Batal extends Error {}

const pgCode = (e: unknown) =>
  (e as { code?: string; cause?: { code?: string } })?.cause?.code ??
  (e as { code?: string })?.code;

/** Pairs parsed rows with their writer, so the row type never widens to a union. */
function siapkan<R>(
  parsed: { ok: R[]; errors: string[] },
  simpan: (tx: Tx, daerahKode: string, rows: R[]) => Promise<Record<string, number>>,
) {
  const errors =
    parsed.errors.length || parsed.ok.length ? parsed.errors : ['Tidak ada baris data.'];
  return { errors, simpan: (tx: Tx, daerahKode: string) => simpan(tx, daerahKode, parsed.ok) };
}

export function registerAdmin(app: Hono<App>, fail: Fail) {
  const auth = (c: Context<App>) => {
    const secret = c.env.BETTER_AUTH_SECRET;
    const baseURL = c.env.BETTER_AUTH_URL;
    // Fail closed: without a secret there is no admin surface at all.
    if (!secret || secret.length < 32 || !baseURL)
      throw fail(500, 'AUTH_BELUM_DIATUR', 'Login admin belum dikonfigurasi di server.');
    return createAuth(c.var.db, { secret, baseURL, trustedOrigins: origins(c) });
  };

  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth(c).handler(c.req.raw));

  app.use(
    '/api/admin/*',
    // Session cookies are SameSite=Lax; this also rejects cross-site form posts outright.
    (c, next) => csrf({ origin: origins(c) })(c, next),
    bodyLimit({
      maxSize: 2_500_000,
      onError: () => {
        throw fail(413, 'TERLALU_BESAR', 'Berkas terlalu besar. Batas 2 MB.');
      },
    }),
    async (c, next) => {
      const session = await auth(c).api.getSession({ headers: c.req.raw.headers });
      if (!session) throw fail(401, 'BELUM_MASUK', 'Masuk sebagai admin terlebih dahulu.');
      await next();
    },
  );

  async function body<S extends z.ZodType>(c: Context<App>, schema: S): Promise<z.output<S>> {
    const parsed = schema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      throw fail(400, 'ISIAN_TIDAK_VALID', 'Isian tidak valid.', parsed.error.issues);
    return parsed.data;
  }

  /** Foreign-key and unique violations are curator mistakes, not server errors. */
  async function tulis<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (e) {
      const code = pgCode(e);
      if (code === '23503')
        throw fail(
          400,
          'RUJUKAN_TIDAK_VALID',
          'Daerah, program, atau dokumen sumber yang dirujuk tidak ditemukan.',
        );
      if (code === '23505') throw fail(409, 'SUDAH_ADA', 'Data dengan kunci yang sama sudah ada.');
      throw e;
    }
  }

  app.post('/api/admin/impor', async (c) => {
    const { jenis, daerahKode, csv, simpan } = await body(c, imporBodySchema);
    const [region] = await c.var.db.select().from(daerah).where(eq(daerah.kode, daerahKode));
    if (!region) throw fail(404, 'DAERAH_TIDAK_DITEMUKAN', 'Daerah tidak ditemukan.');

    const rencana =
      jenis === 'program'
        ? siapkan(parseProgram(csv, daerahKode), simpanProgram)
        : siapkan(parseBidang(csv, daerahKode), simpanBidang);
    if (rencana.errors.length)
      throw fail(400, 'CSV_TIDAK_VALID', 'CSV belum bisa diimpor.', rencana.errors);

    // "Periksa saja" runs the real upsert, then rolls back, so database-level problems
    // (missing bidang, missing source document) show up before anything is written.
    let ringkasan: Record<string, number> = {};
    try {
      await c.var.db.transaction(async (tx) => {
        ringkasan = await rencana.simpan(tx, daerahKode);
        if (!simpan) throw new Batal();
      });
    } catch (e) {
      if (e instanceof ImporError)
        throw fail(400, 'CSV_TIDAK_VALID', 'CSV belum bisa diimpor.', e.masalah);
      if (!(e instanceof Batal)) throw e;
    }
    return c.json({ disimpan: simpan, ringkasan });
  });

  app.post('/api/admin/sumber', async (c) => {
    const data = await body(c, sumberBodySchema);
    const [row] = await tulis(() => c.var.db.insert(sourceDocument).values(data).returning());
    return c.json({ data: row }, 201);
  });

  app.post('/api/admin/evidence', async (c) => {
    const data = await body(c, evidenceBodySchema);
    const [row] = await tulis(() => c.var.db.insert(evidence).values(data).returning());
    return c.json({ data: row }, 201);
  });

  app.delete('/api/admin/evidence/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isSafeInteger(id)) throw fail(400, 'ISIAN_TIDAK_VALID', 'Id bukti tidak valid.');
    const rows = await c.var.db.delete(evidence).where(eq(evidence.id, id)).returning();
    if (!rows.length) throw fail(404, 'BUKTI_TIDAK_DITEMUKAN', 'Bukti tidak ditemukan.');
    return c.json({ data: { id } });
  });

  app.patch('/api/admin/daerah/:daerah/program/:kode', async (c) => {
    const { verified } = await body(c, verifiedBodySchema);
    const rows = await c.var.db
      .update(program)
      .set({ verified })
      .where(
        and(eq(program.daerahKode, c.req.param('daerah')), eq(program.kode, c.req.param('kode'))),
      )
      .returning({ kode: program.kode, verified: program.verified });
    if (!rows.length) throw fail(404, 'PROGRAM_TIDAK_DITEMUKAN', 'Program tidak ditemukan.');
    return c.json({ data: rows[0] });
  });
}
