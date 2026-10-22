/**
 * Seed: reads data/*.csv, validates every row, then upserts idempotently in one transaction.
 * Run: bun run db:seed (needs DATABASE_URL; bun loads .env automatically).
 */
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { z } from 'zod';
import { bidangUrusan, evidence, funding, program, sourceDocument } from '@jejakjanji/shared';

const CHECKED_AT = '2026-10-22';
const SOURCES = {
  RPJMD: {
    title: 'RPJMD Provinsi DKI Jakarta 2025-2029',
    type: 'RPJMD',
    url: 'https://bappeda.jakarta.go.id/rpjmd/storage/documents/files/TSkak06jYdL7FKLrgZORdCW0MyLm36oR0ckv6m9p.pdf',
    version: 'Perda Nomor 2 Tahun 2025',
    checkedAt: CHECKED_AT,
  },
  RKPD: {
    title: 'RKPD Provinsi DKI Jakarta 2026',
    type: 'RKPD',
    url: null,
    version: 'Pergub Nomor 21 Tahun 2025',
    checkedAt: CHECKED_AT,
  },
} as const;
const TAHUN_PAGU = [2026, 2027, 2028, 2029, 2030] as const;

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

const bidangRow = z.object({
  Kode: kode,
  'Bidang urusan / unsur': teks,
  'Pagu indikatif 2026 (Rp)': bulat,
  'Proporsi belanja (%) menurut dokumen': desimal,
  'Halaman PDF': halaman,
  Sumber: jenisSumber,
});

const programRow = z.object({
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

function readCsv(file: string): Record<string, string>[] {
  const path = `data/${file}`;
  if (!existsSync(path)) {
    throw new Error(
      `File ${path} tidak ditemukan. Ekspor dari Google Sheet sesuai data/README.md, lalu jalankan ulang seed.`,
    );
  }
  return parse(readFileSync(path), {
    columns: true,
    bom: true,
    trim: true,
    skip_empty_lines: true,
  });
}

function validate<T extends z.ZodType>(
  file: string,
  rows: Record<string, string>[],
  schema: T,
  skip: (row: Record<string, string>) => boolean = () => false,
) {
  const ok: (z.output<T> & { baris: number })[] = [];
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (skip(row)) return;
    const r = schema.safeParse(row);
    // Line number in the CSV: +1 for header, +1 for 1-based.
    if (r.success) ok.push(Object.assign({}, r.data, { baris: i + 2 }));
    else
      errors.push(
        ...r.error.issues.map(
          (e) => `${file} baris ${i + 2} kolom "${e.path.join('.')}": ${e.message}`,
        ),
      );
  });
  return { ok, errors };
}

// --- main ------------------------------------------------------------------

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL belum diisi. Salin .env.example ke .env.');

  // Rows without Kode are total rows in the sheet: skipped.
  const bidang = validate(
    'bidang_urusan.csv',
    readCsv('bidang_urusan.csv'),
    bidangRow,
    (r) => !r.Kode,
  );
  const programs = validate('program.csv', readCsv('program.csv'), programRow);
  const errors = [...bidang.errors, ...programs.errors];

  const bidangKodes = new Set(bidang.ok.map((b) => b.Kode));
  const seen = new Set<string>();
  programs.ok.forEach((p) => {
    const bk = p.Kode.split('.').slice(0, 2).join('.');
    if (!bidangKodes.has(bk))
      errors.push(`program.csv baris ${p.baris}: bidang "${bk}" tidak ada di bidang_urusan.csv`);
    if (seen.has(p.Kode)) errors.push(`program.csv baris ${p.baris}: kode "${p.Kode}" duplikat`);
    seen.add(p.Kode);
  });
  if (errors.length)
    throw new Error(`Validasi CSV gagal (${errors.length} masalah):\n${errors.join('\n')}`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await db.transaction(async (tx) => {
      const docs = await tx
        .insert(sourceDocument)
        .values(Object.values(SOURCES))
        .onConflictDoUpdate({
          target: [sourceDocument.type, sourceDocument.version],
          set: {
            title: sql`excluded.title`,
            url: sql`excluded.url`,
            checkedAt: sql`excluded.checked_at`,
          },
        })
        .returning();
      const docId = (t: 'RPJMD' | 'RKPD') => docs.find((d) => d.type === t)!.id;

      await tx
        .insert(bidangUrusan)
        .values(
          bidang.ok.map((b) => ({
            kode: b.Kode,
            nama: b['Bidang urusan / unsur'],
            paguIndikatif2026: b['Pagu indikatif 2026 (Rp)'],
            proporsi: b['Proporsi belanja (%) menurut dokumen'],
            sourceDocumentId: docId(b.Sumber),
            pageRef: b['Halaman PDF'],
          })),
        )
        .onConflictDoUpdate({
          target: bidangUrusan.kode,
          set: {
            nama: sql`excluded.nama`,
            paguIndikatif2026: sql`excluded.pagu_indikatif_2026`,
            proporsi: sql`excluded.proporsi`,
            sourceDocumentId: sql`excluded.source_document_id`,
            pageRef: sql`excluded.page_ref`,
          },
        });

      if (!programs.ok.length) return;

      // `verified` is deliberately not overwritten: it is set by humans after checking.
      await tx
        .insert(program)
        .values(
          programs.ok.map((p) => ({
            kode: p.Kode,
            nama: p['Program prioritas'],
            bidangKode: p.Kode.split('.').slice(0, 2).join('.'),
            indikator: p.Indikator,
            satuan: p['Satuan indikator'],
            kondisiAwal: p['Kondisi awal'],
            target2026: p['Target 2026'],
            sourceDocumentId: docId(p.Sumber),
            pageRef: p['Halaman PDF'],
          })),
        )
        .onConflictDoUpdate({
          target: program.kode,
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

      const fundingRows = programs.ok.flatMap((p) =>
        TAHUN_PAGU.flatMap((tahun) => {
          const jumlah = p[`Pagu ${tahun}`];
          return jumlah === ''
            ? []
            : [
                {
                  programKode: p.Kode,
                  tahun,
                  jenis: 'INDIKATIF_RPJMD' as const,
                  jumlahJutaRp: jumlah,
                  sourceDocumentId: docId(p.Sumber),
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
            target: [funding.programKode, funding.tahun, funding.jenis],
            set: {
              jumlahJutaRp: sql`excluded.jumlah_juta_rp`,
              sourceDocumentId: sql`excluded.source_document_id`,
              pageRef: sql`excluded.page_ref`,
            },
          });
      }

      // One RENCANA evidence per program, pointing at the RPJMD page. evidence has no natural
      // unique key, so look up existing rows instead of ON CONFLICT.
      const rpjmd = docId('RPJMD');
      const existing = await tx
        .select({ id: evidence.id, programKode: evidence.programKode })
        .from(evidence)
        .where(and(eq(evidence.jenis, 'RENCANA'), eq(evidence.sourceDocumentId, rpjmd)));
      const byProgram = new Map(existing.map((e) => [e.programKode, e.id]));
      const missing = [];
      for (const p of programs.ok) {
        const id = byProgram.get(p.Kode);
        if (id == null) missing.push(p);
        else
          await tx
            .update(evidence)
            .set({ pageRef: p['Halaman PDF'], checkedAt: CHECKED_AT })
            .where(eq(evidence.id, id));
      }
      if (missing.length) {
        await tx.insert(evidence).values(
          missing.map((p) => ({
            programKode: p.Kode,
            jenis: 'RENCANA' as const,
            sourceDocumentId: rpjmd,
            pageRef: p['Halaman PDF'],
            checkedAt: CHECKED_AT,
          })),
        );
      }
      console.log(
        `Seed selesai: ${docs.length} dokumen, ${bidang.ok.length} bidang, ${programs.ok.length} program, ` +
          `${fundingRows.length} pagu, ${missing.length} evidence RENCANA baru.`,
      );
    });
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
