import {
  bigint,
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';

export const sourceDocumentType = pgEnum('source_document_type', ['RPJMD', 'RKPD']);
export const fundingJenis = pgEnum('funding_jenis', ['INDIKATIF_RPJMD']);
export const evidenceJenis = pgEnum('evidence_jenis', ['RENCANA', 'ANGGARAN', 'PELAKSANAAN']);

export const sourceDocument = pgTable(
  'source_document',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    type: sourceDocumentType('type').notNull(),
    url: text('url'),
    version: text('version').notNull(),
    checkedAt: date('checked_at').notNull(),
  },
  // Natural key so the seed can upsert without hardcoding ids.
  (t) => [unique().on(t.type, t.version)],
);

export const bidangUrusan = pgTable('bidang_urusan', {
  kode: text('kode').primaryKey(),
  nama: text('nama').notNull(),
  // Full rupiah. Max realistic value (~1e14) is well below 2^53.
  paguIndikatif2026: bigint('pagu_indikatif_2026', { mode: 'number' }).notNull(),
  proporsi: numeric('proporsi', { mode: 'number' }).notNull(),
  sourceDocumentId: integer('source_document_id')
    .notNull()
    .references(() => sourceDocument.id),
  pageRef: integer('page_ref').notNull(),
});

export const program = pgTable('program', {
  kode: text('kode').primaryKey(),
  nama: text('nama').notNull(),
  bidangKode: text('bidang_kode')
    .notNull()
    .references(() => bidangUrusan.kode),
  indikator: text('indikator').notNull(),
  satuan: text('satuan').notNull(),
  kondisiAwal: text('kondisi_awal').notNull(),
  target2026: text('target_2026').notNull(),
  sourceDocumentId: integer('source_document_id')
    .notNull()
    .references(() => sourceDocument.id),
  pageRef: integer('page_ref').notNull(),
  verified: boolean('verified').notNull().default(false),
});

export const funding = pgTable(
  'funding',
  {
    id: serial('id').primaryKey(),
    programKode: text('program_kode')
      .notNull()
      .references(() => program.kode),
    tahun: integer('tahun').notNull(),
    jenis: fundingJenis('jenis').notNull(),
    jumlahJutaRp: bigint('jumlah_juta_rp', { mode: 'number' }).notNull(),
    sourceDocumentId: integer('source_document_id')
      .notNull()
      .references(() => sourceDocument.id),
    pageRef: integer('page_ref').notNull(),
  },
  (t) => [unique().on(t.programKode, t.tahun, t.jenis)],
);

export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  programKode: text('program_kode')
    .notNull()
    .references(() => program.kode),
  jenis: evidenceJenis('jenis').notNull(),
  sourceDocumentId: integer('source_document_id').references(() => sourceDocument.id),
  pageRef: integer('page_ref'),
  cakupanPencarian: text('cakupan_pencarian'),
  checkedAt: date('checked_at').notNull(),
  catatan: text('catatan'),
});

export type SourceDocument = typeof sourceDocument.$inferSelect;
export type BidangUrusan = typeof bidangUrusan.$inferSelect;
export type Program = typeof program.$inferSelect;
export type Funding = typeof funding.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type EvidenceJenis = (typeof evidenceJenis.enumValues)[number];
