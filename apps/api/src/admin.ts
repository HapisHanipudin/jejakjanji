import type { Context, Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { csrf } from 'hono/csrf';
import type { HTTPException } from 'hono/http-exception';
import { and, desc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { z } from 'zod';
import {
  adminAudit,
  daerah,
  daerahBodySchema,
  daerahUpdateSchema,
  evidence,
  evidenceBodySchema,
  evidenceUpdateSchema,
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
export type App = {
  Bindings: AdminEnv;
  Variables: { db: NodePgDatabase; admin: { id: string; email: string } };
};
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
      c.set('admin', { id: session.user.id, email: session.user.email });
      await next();
    },
  );

  async function body<S extends z.ZodType>(c: Context<App>, schema: S): Promise<z.output<S>> {
    const parsed = schema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      throw fail(400, 'ISIAN_TIDAK_VALID', 'Isian tidak valid.', parsed.error.issues);
    return parsed.data;
  }

  /** Records an admin write in the same transaction as the write itself. */
  const catat = (c: Context<App>, tx: Tx, aksi: string, target: string, detail: unknown) =>
    tx.insert(adminAudit).values({
      userId: c.var.admin.id,
      userEmail: c.var.admin.email,
      aksi,
      target,
      detail,
    });

  /**
   * Runs a write and its audit row in one transaction. Foreign-key and unique violations are
   * curator mistakes, not server errors.
   */
  async function tulis<T>(c: Context<App>, run: (tx: Tx) => Promise<T>): Promise<T> {
    try {
      return await c.var.db.transaction(run);
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
        await catat(c, tx, 'impor', `${jenis} ${daerahKode}`, ringkasan);
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
    const row = await tulis(c, async (tx) => {
      const [row] = await tx.insert(sourceDocument).values(data).returning();
      await catat(c, tx, 'tambah_sumber', `dokumen ${row!.id}`, row);
      return row;
    });
    return c.json({ data: row }, 201);
  });

  app.post('/api/admin/evidence', async (c) => {
    const data = await body(c, evidenceBodySchema);
    const row = await tulis(c, async (tx) => {
      const [row] = await tx.insert(evidence).values(data).returning();
      await catat(c, tx, 'tambah_bukti', `${data.daerahKode}/${data.programKode}`, row);
      return row;
    });
    return c.json({ data: row }, 201);
  });

  const idBukti = (c: Context<App>) => {
    const id = Number(c.req.param('id'));
    if (!Number.isSafeInteger(id)) throw fail(400, 'ISIAN_TIDAK_VALID', 'Id bukti tidak valid.');
    return id;
  };
  const tidakAda = () => fail(404, 'BUKTI_TIDAK_DITEMUKAN', 'Bukti tidak ditemukan.');

  app.put('/api/admin/evidence/:id', async (c) => {
    const id = idBukti(c);
    const data = await body(c, evidenceUpdateSchema);
    const row = await tulis(c, async (tx) => {
      const [sebelum] = await tx.select().from(evidence).where(eq(evidence.id, id)).for('update');
      if (!sebelum) throw tidakAda();
      const [sesudah] = await tx.update(evidence).set(data).where(eq(evidence.id, id)).returning();
      await catat(c, tx, 'ubah_bukti', `${sebelum.daerahKode}/${sebelum.programKode}`, {
        sebelum,
        sesudah,
      });
      return sesudah;
    });
    return c.json({ data: row });
  });

  app.delete('/api/admin/evidence/:id', async (c) => {
    const id = idBukti(c);
    await tulis(c, async (tx) => {
      const [row] = await tx.delete(evidence).where(eq(evidence.id, id)).returning();
      if (!row) throw tidakAda();
      await catat(c, tx, 'hapus_bukti', `${row.daerahKode}/${row.programKode}`, row);
    });
    return c.json({ data: { id } });
  });

  app.patch('/api/admin/daerah/:daerah/program/:kode', async (c) => {
    const { verified } = await body(c, verifiedBodySchema);
    const daerahKode = c.req.param('daerah');
    const kode = c.req.param('kode');
    const row = await tulis(c, async (tx) => {
      const [row] = await tx
        .update(program)
        .set({ verified })
        .where(and(eq(program.daerahKode, daerahKode), eq(program.kode, kode)))
        .returning({ kode: program.kode, verified: program.verified });
      if (!row) throw fail(404, 'PROGRAM_TIDAK_DITEMUKAN', 'Program tidak ditemukan.');
      await catat(c, tx, 'verifikasi_program', `${daerahKode}/${kode}`, { verified });
      return row;
    });
    return c.json({ data: row });
  });

  app.post('/api/admin/daerah', async (c) => {
    const data = await body(c, daerahBodySchema);
    const row = await tulis(c, async (tx) => {
      const [row] = await tx.insert(daerah).values(data).returning();
      await catat(c, tx, 'tambah_daerah', data.kode, row);
      return row;
    });
    return c.json({ data: row }, 201);
  });

  app.patch('/api/admin/daerah/:kode', async (c) => {
    const data = await body(c, daerahUpdateSchema);
    const kode = c.req.param('kode');
    if (!Object.keys(data).length) throw fail(400, 'ISIAN_TIDAK_VALID', 'Tidak ada yang diubah.');
    const row = await tulis(c, async (tx) => {
      const [sebelum] = await tx.select().from(daerah).where(eq(daerah.kode, kode)).for('update');
      if (!sebelum) throw fail(404, 'DAERAH_TIDAK_DITEMUKAN', 'Daerah tidak ditemukan.');
      const [sesudah] = await tx.update(daerah).set(data).where(eq(daerah.kode, kode)).returning();
      await catat(c, tx, 'ubah_daerah', kode, { sebelum, sesudah });
      return sesudah;
    });
    return c.json({ data: row });
  });

  app.get('/api/admin/audit', async (c) => {
    // ponytail: newest 200 only, no paging; add a cursor when the log outgrows one screen.
    const data = await c.var.db
      .select({
        id: adminAudit.id,
        userEmail: adminAudit.userEmail,
        aksi: adminAudit.aksi,
        target: adminAudit.target,
        detail: adminAudit.detail,
        createdAt: adminAudit.createdAt,
      })
      .from(adminAudit)
      .orderBy(desc(adminAudit.id))
      .limit(200);
    return c.json({ data });
  });
}
