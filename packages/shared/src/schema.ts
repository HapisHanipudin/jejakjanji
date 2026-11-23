import {
  bigint,
  foreignKey,
  primaryKey,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { JENIS_DOKUMEN } from './api.ts';

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
    ppidEmail: text('ppid_email'),
  },
  (t) => [foreignKey({ columns: [t.indukKode], foreignColumns: [t.kode] })],
);

export const sourceDocumentType = pgEnum('source_document_type', JENIS_DOKUMEN);
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

// --- Admin accounts (Better Auth core schema) --------------------------------
// Only curators have accounts; visitors never do. Rows are created by scripts/create-admin.ts.
// Column set follows https://better-auth.com/docs/concepts/database#core-schema (1.7).
const dibuat = () => timestamp('created_at').notNull().defaultNow();
const diubah = () =>
  timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const adminUser = pgTable('admin_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: dibuat(),
  updatedAt: diubah(),
});

export const adminSession = pgTable('admin_session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => adminUser.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: dibuat(),
  updatedAt: diubah(),
});

export const adminAccount = pgTable('admin_account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => adminUser.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: dibuat(),
  updatedAt: diubah(),
});

export const adminVerification = pgTable('admin_verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: dibuat(),
  updatedAt: diubah(),
});

/** Better Auth rate-limit counters (storage: "database"), shared by every isolate. */
export const adminRateLimit = pgTable('admin_rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});

/** One row per admin write: who did what to which record. The email survives account removal. */
export const adminAudit = pgTable('admin_audit', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => adminUser.id, { onDelete: 'set null' }),
  userEmail: text('user_email').notNull(),
  aksi: text('aksi').notNull(),
  target: text('target').notNull(),
  detail: jsonb('detail'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export type SourceDocument = typeof sourceDocument.$inferSelect;
export type BidangUrusan = typeof bidangUrusan.$inferSelect;
export type Program = typeof program.$inferSelect;
export type Funding = typeof funding.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type EvidenceJenis = (typeof evidenceJenis.enumValues)[number];
