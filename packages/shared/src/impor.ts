/**
 * CSV import rules, shared by scripts/seed.ts and the admin API so both validate and upsert the
 * same way. Not re-exported from index.ts: csv-parse must stay out of the browser bundle.
 */
import { parse } from 'csv-parse/sync';
import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { z } from 'zod';
import { bidangUrusan, evidence, funding, program, sourceDocument } from './schema.ts';

export type Tx = Parameters<Parameters<NodePgDatabase['transaction']>[0]>[0];
export const TAHUN_PAGU = [2026, 2027, 2028, 2029, 2030] as const;

/** Every problem found, one line each, so a curator can fix the sheet in one pass. */
export class ImporError extends Error {
  constructor(public readonly masalah: string[]) {
    super(`Validasi CSV gagal (${masalah.length} masalah):\n${masalah.join('\n')}`);
  }
}

// --- parsing helpers -------------------------------------------------------

const kode = z.string().regex(/^[0-9A-Za-z]+(\.[0-9A-Za-z]+)+$/, 'format kode tidak dikenal');
const teks = z.string().min(1, 'wajib diisi');
const halaman = z.string().regex(/^\d+$/, 'halaman harus bilangan bulat').transform(Number);

// Integers may use Indonesian thousand dots ("19.550.176.404.217"). Commas are rejected
// rather than guessed, because they could be either a decimal or a thousands separator.
const bulat = z
  .string()
  .transform((s) => s.replace(/^Rp/i, '').replace(/[\s.]/g, ''))
  .pipe(z.string().regex(/^\d+$/, 'harus bilangan bulat (pemisah ribuan titik)'))
  .transform(Number)
  .refine(Number.isSafeInteger, 'angka terlalu besar');

// Decimal comma ("12,34" or "12,34%").
const desimal = z
  .string()
  .transform((s) => s.replace('%', '').replace(/\./g, '').replace(',', '.').trim())
  .pipe(z.string().regex(/^\d+(\.\d+)?$/, 'harus angka dengan koma desimal'))
  .transform(Number);

const jenisSumber = z.string().transform((s, ctx) => {
  const hits = (['RPJMD', 'RKPD'] as const).filter((t) => s.toUpperCase().includes(t));
  if (hits.length !== 1) {
    ctx.addIssue({
      code: 'custom',
      message: `sumber "${s}" harus menyebut tepat satu dari RPJMD/RKPD`,
    });
    return z.NEVER;
  }
  return hits[0]!;
});

// Empty pagu cell = no number in the source; skipped, never filled in.
const pagu = z.union([z.literal(''), bulat]);

const daerahKolom = (daerahKode: string) =>
  z.literal(daerahKode, `daerah_kode harus "${daerahKode}"`);

const bidangRow = (daerahKode: string) =>
  z.object({
    daerah_kode: daerahKolom(daerahKode),
    Kode: kode,
    'Bidang urusan / unsur': teks,
    'Pagu indikatif 2026 (Rp)': bulat,
    'Proporsi belanja (%) menurut dokumen': desimal,
    'Halaman PDF': halaman,
    Sumber: jenisSumber,
  });

const programRow = (daerahKode: string) =>
  z.object({
    daerah_kode: daerahKolom(daerahKode),
    Kode: kode,
    'Program prioritas': teks,
    Indikator: teks,
    'Satuan indikator': teks,
    'Kondisi awal': teks,
    'Target 2026': teks,
    'Pagu 2026': pagu,
    'Pagu 2027': pagu,
    'Pagu 2028': pagu,
    'Pagu 2029': pagu,
    'Pagu 2030': pagu,
    'Halaman PDF': halaman,
    Sumber: jenisSumber,
    'Satuan pagu': z.string().refine((s) => /juta/i.test(s), 'satuan pagu harus juta rupiah'),
  });

export type BarisBidang = z.output<ReturnType<typeof bidangRow>> & { baris: number };
export type BarisProgram = z.output<ReturnType<typeof programRow>> & { baris: number };

function validate<T extends z.ZodType<{ Kode: string }>>(
  file: string,
  csv: string | Uint8Array,
  schema: T,
  skip: (row: Record<string, string>) => boolean = () => false,
) {
  const ok: (z.output<T> & { baris: number })[] = [];
  const errors: string[] = [];
  let rows: Record<string, string>[];
  try {
    rows = parse(csv as string, { columns: true, bom: true, trim: true, skip_empty_lines: true });
  } catch (e) {
    return {
      ok,
      errors: [`${file}: CSV tidak bisa dibaca (${e instanceof Error ? e.message : e})`],
    };
  }
  const seen = new Set<string>();
  rows.forEach((row, i) => {
    if (skip(row)) return;
    // Line number in the CSV: +1 for header, +1 for 1-based.
    const baris = i + 2;
    const r = schema.safeParse(row);
    if (!r.success) {
      errors.push(
        ...r.error.issues.map(
          (e) => `${file} baris ${baris} kolom "${e.path.join('.')}": ${e.message}`,
        ),
      );
      return;
    }
    if (seen.has(r.data.Kode))
      errors.push(`${file} baris ${baris}: kode "${r.data.Kode}" duplikat`);
    seen.add(r.data.Kode);
    ok.push(Object.assign({}, r.data, { baris }));
  });
  return { ok, errors };
}

// Rows without Kode are total rows in the sheet: skipped.
export const parseBidang = (csv: string | Uint8Array, daerahKode: string) =>
  validate('bidang_urusan.csv', csv, bidangRow(daerahKode), (r) => !r.Kode);

export const parseProgram = (csv: string | Uint8Array, daerahKode: string) =>
  validate('program.csv', csv, programRow(daerahKode));

// --- writing ---------------------------------------------------------------

/** The CSV names a document type, not a version, so each type must resolve to exactly one row. */
async function dokumen(tx: Tx, daerahKode: string, types: Iterable<'RPJMD' | 'RKPD'>) {
  const docs = await tx
    .select()
    .from(sourceDocument)
    .where(eq(sourceDocument.daerahKode, daerahKode));
  const masalah: string[] = [];
  const out = new Map<string, (typeof docs)[number]>();
  for (const t of new Set(types)) {
    const hit = docs.filter((d) => d.type === t);
    if (hit.length === 1) out.set(t, hit[0]!);
    else
      masalah.push(
        hit.length
          ? `Daerah ${daerahKode} punya ${hit.length} dokumen sumber ${t}; impor belum bisa memilih versinya.`
          : `Dokumen sumber ${t} untuk daerah ${daerahKode} belum ada. Tambahkan dokumen sumber dulu.`,
      );
  }
  if (masalah.length) throw new ImporError(masalah);
  return (t: 'RPJMD' | 'RKPD') => out.get(t)!;
}

export async function simpanBidang(tx: Tx, daerahKode: string, rows: BarisBidang[]) {
  if (!rows.length) return { bidang: 0 };
  const doc = await dokumen(
    tx,
    daerahKode,
    rows.map((b) => b.Sumber),
  );
  await tx
    .insert(bidangUrusan)
    .values(
      rows.map((b) => ({
        daerahKode,
        kode: b.Kode,
        nama: b['Bidang urusan / unsur'],
        paguIndikatif2026: b['Pagu indikatif 2026 (Rp)'],
        proporsi: b['Proporsi belanja (%) menurut dokumen'],
        sourceDocumentId: doc(b.Sumber).id,
        pageRef: b['Halaman PDF'],
      })),
    )
    .onConflictDoUpdate({
      target: [bidangUrusan.daerahKode, bidangUrusan.kode],
      set: {
        nama: sql`excluded.nama`,
        paguIndikatif2026: sql`excluded.pagu_indikatif_2026`,
        proporsi: sql`excluded.proporsi`,
        sourceDocumentId: sql`excluded.source_document_id`,
        pageRef: sql`excluded.page_ref`,
      },
    });
  return { bidang: rows.length };
}

const bidangDari = (kodeProgram: string) => kodeProgram.split('.').slice(0, 2).join('.');

export async function simpanProgram(tx: Tx, daerahKode: string, rows: BarisProgram[]) {
  if (!rows.length) return { program: 0, pagu: 0, evidenceBaru: 0 };
  const ada = new Set(
    (
      await tx
        .select({ kode: bidangUrusan.kode })
        .from(bidangUrusan)
        .where(eq(bidangUrusan.daerahKode, daerahKode))
    ).map((b) => b.kode),
  );
  const masalah = rows
    .filter((p) => !ada.has(bidangDari(p.Kode)))
    .map(
      (p) =>
        `program.csv baris ${p.baris}: bidang "${bidangDari(p.Kode)}" belum ada. Impor bidang_urusan.csv dulu.`,
    );
  if (masalah.length) throw new ImporError(masalah);

  // The RENCANA evidence always points at the RPJMD, so it is required even if no row cites it.
  const doc = await dokumen(tx, daerahKode, [...rows.map((p) => p.Sumber), 'RPJMD']);

  // `verified` is deliberately not overwritten: it is set by humans after checking.
  await tx
    .insert(program)
    .values(
      rows.map((p) => ({
        daerahKode,
        kode: p.Kode,
        nama: p['Program prioritas'],
        bidangKode: bidangDari(p.Kode),
        indikator: p.Indikator,
        satuan: p['Satuan indikator'],
        kondisiAwal: p['Kondisi awal'],
        target2026: p['Target 2026'],
        sourceDocumentId: doc(p.Sumber).id,
        pageRef: p['Halaman PDF'],
      })),
    )
    .onConflictDoUpdate({
      target: [program.daerahKode, program.kode],
      set: {
        nama: sql`excluded.nama`,
        bidangKode: sql`excluded.bidang_kode`,
        indikator: sql`excluded.indikator`,
        satuan: sql`excluded.satuan`,
        kondisiAwal: sql`excluded.kondisi_awal`,
        target2026: sql`excluded.target_2026`,
        sourceDocumentId: sql`excluded.source_document_id`,
        pageRef: sql`excluded.page_ref`,
      },
    });

  const fundingRows = rows.flatMap((p) =>
    TAHUN_PAGU.flatMap((tahun) => {
      const jumlah = p[`Pagu ${tahun}`];
      return jumlah === ''
        ? []
        : [
            {
              daerahKode,
              programKode: p.Kode,
              tahun,
              jenis: 'INDIKATIF_RPJMD' as const,
              jumlahJutaRp: jumlah,
              sourceDocumentId: doc(p.Sumber).id,
              pageRef: p['Halaman PDF'],
            },
          ];
    }),
  );
  if (fundingRows.length) {
    await tx
      .insert(funding)
      .values(fundingRows)
      .onConflictDoUpdate({
        target: [funding.daerahKode, funding.programKode, funding.tahun, funding.jenis],
        set: {
          jumlahJutaRp: sql`excluded.jumlah_juta_rp`,
          sourceDocumentId: sql`excluded.source_document_id`,
          pageRef: sql`excluded.page_ref`,
        },
      });
  }

  // One RENCANA evidence per program, pointing at the RPJMD page. evidence has no natural
  // unique key, so look up existing rows instead of ON CONFLICT.
  const rpjmd = doc('RPJMD');
  const existing = await tx
    .select({ id: evidence.id, programKode: evidence.programKode })
    .from(evidence)
    .where(
      and(
        eq(evidence.daerahKode, daerahKode),
        eq(evidence.jenis, 'RENCANA'),
        eq(evidence.sourceDocumentId, rpjmd.id),
      ),
    );
  const byProgram = new Map(existing.map((e) => [e.programKode, e.id]));
  const missing = [];
  for (const p of rows) {
    const id = byProgram.get(p.Kode);
    if (id == null) missing.push(p);
    else
      await tx
        .update(evidence)
        .set({ pageRef: p['Halaman PDF'], checkedAt: rpjmd.checkedAt })
        .where(eq(evidence.id, id));
  }
  if (missing.length) {
    await tx.insert(evidence).values(
      missing.map((p) => ({
        daerahKode,
        programKode: p.Kode,
        jenis: 'RENCANA' as const,
        sourceDocumentId: rpjmd.id,
        pageRef: p['Halaman PDF'],
        checkedAt: rpjmd.checkedAt,
      })),
    );
  }
  return { program: rows.length, pagu: fundingRows.length, evidenceBaru: missing.length };
}
