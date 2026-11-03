import {
  bigint,
  foreignKey,
  primaryKey,
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

export const daerahTingkat = pgEnum('daerah_tingkat', ['PROVINSI', 'KABUPATEN', 'KOTA']);
export const statusKurasi = pgEnum('status_kurasi', ['BELUM_DIKURASI', 'AKTIF']);
export const daerah = pgTable(
  'daerah',
  {
    kode: text('kode').primaryKey(),
    slug: text('slug').notNull().unique(),
    nama: text('nama').notNull(),
    tingkat: daerahTingkat('tingkat').notNull(),
    indukKode: text('induk_kode'),
    statusKurasi: statusKurasi('status_kurasi').notNull().default('BELUM_DIKURASI'),
    ppidUrl: text('ppid_url'),
  },
  (t) => [foreignKey({ columns: [t.indukKode], foreignColumns: [t.kode] })],
);

export const sourceDocumentType = pgEnum('source_document_type', ['RPJMD', 'RKPD']);
export const fundingJenis = pgEnum('funding_jenis', ['INDIKATIF_RPJMD']);
export const evidenceJenis = pgEnum('evidence_jenis', ['RENCANA', 'ANGGARAN', 'PELAKSANAAN']);

export const sourceDocument = pgTable(
  'source_document',
  {
    id: serial('id').primaryKey(),
    daerahKode: text('daerah_kode')
      .notNull()
      .default('31')
      .references(() => daerah.kode),
    title: text('title').notNull(),
    type: sourceDocumentType('type').notNull(),
    url: text('url'),
    version: text('version').notNull(),
    checkedAt: date('checked_at').notNull(),
  },
  // Natural key so the seed can upsert without hardcoding ids.
  (t) => [unique().on(t.daerahKode, t.type, t.version), unique().on(t.daerahKode, t.id)],
);

export const bidangUrusan = pgTable(
  'bidang_urusan',
  {
    daerahKode: text('daerah_kode')
      .notNull()
      .default('31')
      .references(() => daerah.kode),
    kode: text('kode').notNull(),
    nama: text('nama').notNull(),
    // Full rupiah. Max realistic value (~1e14) is well below 2^53.
    paguIndikatif2026: bigint('pagu_indikatif_2026', { mode: 'number' }).notNull(),
    proporsi: numeric('proporsi', { mode: 'number' }).notNull(),
    sourceDocumentId: integer('source_document_id').notNull(),
    pageRef: integer('page_ref').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.daerahKode, t.kode] }),
    foreignKey({
      columns: [t.daerahKode, t.sourceDocumentId],
      foreignColumns: [sourceDocument.daerahKode, sourceDocument.id],
    }),
  ],
);

export const program = pgTable(
  'program',
  {
    daerahKode: text('daerah_kode')
      .notNull()
      .default('31')
      .references(() => daerah.kode),
    kode: text('kode').notNull(),
    nama: text('nama').notNull(),
    bidangKode: text('bidang_kode').notNull(),
    indikator: text('indikator').notNull(),
    satuan: text('satuan').notNull(),
    kondisiAwal: text('kondisi_awal').notNull(),
    target2026: text('target_2026').notNull(),
    sourceDocumentId: integer('source_document_id').notNull(),
    pageRef: integer('page_ref').notNull(),
    verified: boolean('verified').notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.daerahKode, t.kode] }),
    foreignKey({
      columns: [t.daerahKode, t.bidangKode],
      foreignColumns: [bidangUrusan.daerahKode, bidangUrusan.kode],
    }),
    foreignKey({
      columns: [t.daerahKode, t.sourceDocumentId],
      foreignColumns: [sourceDocument.daerahKode, sourceDocument.id],
    }),
  ],
);

export const funding = pgTable(
  'funding',
  {
    id: serial('id').primaryKey(),
    daerahKode: text('daerah_kode')
      .notNull()
      .default('31')
      .references(() => daerah.kode),
    programKode: text('program_kode').notNull(),
    tahun: integer('tahun').notNull(),
    jenis: fundingJenis('jenis').notNull(),
    jumlahJutaRp: bigint('jumlah_juta_rp', { mode: 'number' }).notNull(),
    sourceDocumentId: integer('source_document_id').notNull(),
    pageRef: integer('page_ref').notNull(),
  },
  (t) => [
    unique().on(t.daerahKode, t.programKode, t.tahun, t.jenis),
    foreignKey({
      columns: [t.daerahKode, t.programKode],
      foreignColumns: [program.daerahKode, program.kode],
    }),
    foreignKey({
      columns: [t.daerahKode, t.sourceDocumentId],
      foreignColumns: [sourceDocument.daerahKode, sourceDocument.id],
    }),
  ],
);

export const evidence = pgTable(
  'evidence',
  {
    id: serial('id').primaryKey(),
    daerahKode: text('daerah_kode')
      .notNull()
      .default('31')
      .references(() => daerah.kode),
    programKode: text('program_kode').notNull(),
    jenis: evidenceJenis('jenis').notNull(),
    sourceDocumentId: integer('source_document_id'),
    pageRef: integer('page_ref'),
    cakupanPencarian: text('cakupan_pencarian'),
    checkedAt: date('checked_at').notNull(),
    catatan: text('catatan'),
  },
  (t) => [
    foreignKey({
      columns: [t.daerahKode, t.programKode],
      foreignColumns: [program.daerahKode, program.kode],
    }),
    foreignKey({
      columns: [t.daerahKode, t.sourceDocumentId],
      foreignColumns: [sourceDocument.daerahKode, sourceDocument.id],
    }),
  ],
);

export type SourceDocument = typeof sourceDocument.$inferSelect;
export type BidangUrusan = typeof bidangUrusan.$inferSelect;
export type Program = typeof program.$inferSelect;
export type Funding = typeof funding.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type EvidenceJenis = (typeof evidenceJenis.enumValues)[number];
