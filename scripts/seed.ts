/**
 * Seed: reads data/*.csv, validates every row, then upserts idempotently in one transaction.
 * Run: bun run db:seed (needs DATABASE_URL; bun loads .env automatically).
 */
import { existsSync, readFileSync } from 'node:fs';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { daerah, sourceDocument } from '@jejakjanji/shared';
import {
  ImporError,
  parseBidang,
  parseProgram,
  simpanBidang,
  simpanProgram,
} from '@jejakjanji/shared/impor';

const DAERAH = '31';
const CHECKED_AT = '2026-10-22';
const SOURCES = {
  RPJMD: {
    daerahKode: DAERAH,
    title: 'RPJMD Provinsi DKI Jakarta 2025-2029',
    type: 'RPJMD',
    url: 'https://bappeda.jakarta.go.id/show_file/doc_list/EyJrGwJ8u84AkWxoQW7VWuTgpTz1TMr45Q3dbRAF.pdf',
    version: 'Perda Nomor 2 Tahun 2025',
    checkedAt: CHECKED_AT,
  },
  RKPD: {
    daerahKode: DAERAH,
    title: 'RKPD Provinsi DKI Jakarta 2026',
    type: 'RKPD',
    url: 'https://bappeda.jakarta.go.id/show_file/doc_list/kO5eh8zrQTzJVKQFtpoYr0wXrAvXKvMdOlUcxwCt.pdf',
    version: 'Pergub Nomor 21 Tahun 2025',
    checkedAt: CHECKED_AT,
  },
} as const;

// CSV parsing, validation, and upserts live in packages/shared/src/impor.ts (shared with the
// admin API).

function readCsv(file: string) {
  const path = `data/${file}`;
  if (!existsSync(path)) {
    throw new Error(
      `File ${path} tidak ditemukan. Ekspor dari Google Sheet sesuai data/README.md, lalu jalankan ulang seed.`,
    );
  }
  return readFileSync(path);
}

// --- main ------------------------------------------------------------------

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL belum diisi. Salin .env.example ke .env.');

  const bidang = parseBidang(readCsv('bidang_urusan.csv'), DAERAH);
  const programs = parseProgram(readCsv('program.csv'), DAERAH);
  const errors = [...bidang.errors, ...programs.errors];
  if (errors.length) throw new ImporError(errors);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(daerah)
        .values({
          kode: DAERAH,
          slug: 'dki-jakarta',
          nama: 'DKI Jakarta',
          tingkat: 'PROVINSI',
          statusKurasi: 'AKTIF',
          // Official Jakarta PPID FAQ and request form, checked 3 November 2026.
          ppidUrl: 'https://ppid.jakarta.go.id/permohonan-informasi',
          // General PPID contact in the footer of ppid.jakarta.go.id and its Kontak Kami page,
          // checked 8 November 2026. The site lists the online form as the request channel.
          ppidEmail: 'ppid@jakarta.go.id',
        })
        .onConflictDoUpdate({
          target: daerah.kode,
          set: {
            ppidUrl: sql`coalesce(${daerah.ppidUrl}, excluded.ppid_url)`,
            ppidEmail: sql`coalesce(${daerah.ppidEmail}, excluded.ppid_email)`,
          },
        });
      const docs = await tx
        .insert(sourceDocument)
        .values(Object.values(SOURCES))
        .onConflictDoUpdate({
          target: [sourceDocument.daerahKode, sourceDocument.type, sourceDocument.version],
          set: {
            title: sql`excluded.title`,
            url: sql`excluded.url`,
            checkedAt: sql`excluded.checked_at`,
          },
        })
        .returning();

      await simpanBidang(tx, DAERAH, bidang.ok);
      const hasil = await simpanProgram(tx, DAERAH, programs.ok);
      console.log(
        `Seed selesai: ${docs.length} dokumen, ${bidang.ok.length} bidang, ${programs.ok.length} program, ` +
          `${hasil.pagu} pagu, ${hasil.evidenceBaru} evidence RENCANA baru.`,
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
