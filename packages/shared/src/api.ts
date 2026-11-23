import { z } from 'zod';

// Validation messages in Indonesian (UI and API language).
z.config(z.locales.id());

/**
 * Source document types. RPJMD and RKPD back plans and indicative budgets; APBD (budget) and
 * LKPJ (head of region's accountability report) back budget and implementation evidence.
 * Shared with the pgEnum in schema.ts.
 */
export const JENIS_DOKUMEN = ['RPJMD', 'RKPD', 'APBD', 'LKPJ'] as const;

export const LABEL_PAGU = 'Pagu indikatif, bukan APBD dan bukan realisasi';

export const daerahSchema = z.object({
  kode: z.string(),
  slug: z.string(),
  nama: z.string(),
  tingkat: z.enum(['PROVINSI', 'KABUPATEN', 'KOTA']),
  statusKurasi: z.enum(['BELUM_DIKURASI', 'AKTIF']),
  ppidUrl: z.url({ protocol: /^https?$/ }).nullable(),
  // Default keeps the web working against an API deployed before migration 0002.
  ppidEmail: z.email().nullable().default(null),
});
export const daerahListSchema = z.object({ data: z.array(daerahSchema) });
export type Daerah = z.infer<typeof daerahSchema>;
export const JAKARTA = { kode: '31', slug: 'dki-jakarta', nama: 'DKI Jakarta' } as const;

const label = z.literal(LABEL_PAGU);
const nilaiStatus = z.enum(['ada', 'belum_diketahui']);
export const statusBuktiSchema = z.object({
  rencana: nilaiStatus,
  anggaran: nilaiStatus,
  pelaksanaan: nilaiStatus,
});

export const programQuerySchema = z.object({
  daerah: z.string().trim().min(1).max(100).optional(),
  bidang: z.string().trim().min(1).optional(),
  status: nilaiStatus.optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const sourceDocumentSchema = z.object({
  id: z.number().int(),
  daerahKode: z.string().optional(),
  title: z.string(),
  type: z.enum(JENIS_DOKUMEN),
  url: z.string().nullable(),
  version: z.string(),
  checkedAt: z.string(),
});

export const bidangUrusanListSchema = z.object({
  label,
  daerah: daerahSchema.optional(),
  data: z.array(
    z.object({
      kode: z.string(),
      nama: z.string(),
      paguIndikatif2026: z.number(),
      proporsi: z.number(),
      sourceDocumentId: z.number().int(),
      pageRef: z.number().int(),
    }),
  ),
});

export const programListSchema = z.object({
  label,
  daerah: daerahSchema.optional(),
  data: z.array(
    z.object({
      kode: z.string(),
      nama: z.string(),
      bidangKode: z.string(),
      pagu2026: z
        .object({
          jumlahJutaRp: z.number(),
          sourceDocumentId: z.number().int(),
          pageRef: z.number().int(),
        })
        .nullable(),
      paguPerTahun: z.array(
        z.object({
          tahun: z.number().int(),
          jumlahJutaRp: z.number(),
          sourceDocumentId: z.number().int(),
          pageRef: z.number().int(),
        }),
      ),
      statusBukti: statusBuktiSchema,
    }),
  ),
});

export const programDetailSchema = z.object({
  label,
  daerah: daerahSchema.optional(),
  data: z
    .object({
      kode: z.string(),
      nama: z.string(),
      bidangKode: z.string(),
      indikator: z.string(),
      satuan: z.string(),
      kondisiAwal: z.string(),
      target2026: z.string(),
      pageRef: z.number().int(),
      verified: z.boolean(),
      sumber: sourceDocumentSchema,
      pagu: z.array(
        z.object({
          tahun: z.number().int(),
          jenis: z.literal('INDIKATIF_RPJMD'),
          jumlahJutaRp: z.number(),
          sourceDocumentId: z.number().int(),
          pageRef: z.number().int(),
        }),
      ),
      evidence: z.array(
        z.object({
          id: z.number().int(),
          jenis: z.enum(['RENCANA', 'ANGGARAN', 'PELAKSANAAN']),
          sourceDocumentId: z.number().int().nullable(),
          pageRef: z.number().int().nullable(),
          cakupanPencarian: z.string().nullable(),
          checkedAt: z.string(),
          catatan: z.string().nullable(),
        }),
      ),
      statusBukti: statusBuktiSchema,
    })
    .nullable(),
});

export const sumberListSchema = z.object({
  daerah: daerahSchema.optional(),
  data: z.array(sourceDocumentSchema),
});

export const errorSchema = z.object({
  error: z.object({ kode: z.string(), pesan: z.string(), detail: z.unknown().optional() }),
});

// --- Admin (curator) API ---------------------------------------------------

const tanggal = z.iso.date();
const teksOpsional = z
  .string()
  .trim()
  .max(2000)
  .transform((s) => s || null)
  .nullable();

export const imporBodySchema = z.object({
  jenis: z.enum(['bidang_urusan', 'program']),
  daerahKode: z.string().min(1).max(20),
  csv: z.string().min(1).max(2_000_000),
  // false = validate only (the transaction is rolled back).
  simpan: z.boolean(),
});
export const imporHasilSchema = z.object({
  disimpan: z.boolean(),
  ringkasan: z.record(z.string(), z.number()),
});

/**
 * Evidence is either a citation (document + PDF page) or a search record (what was searched and
 * found nothing). Only the first counts as "ada" in hitungStatusBukti.
 */
const evidenceIsi = z.object({
  jenis: z.enum(['RENCANA', 'ANGGARAN', 'PELAKSANAAN']),
  sourceDocumentId: z.number().int().positive().nullable(),
  pageRef: z.number().int().positive().nullable(),
  cakupanPencarian: teksOpsional,
  checkedAt: tanggal,
  catatan: teksOpsional,
});
const cekBukti = (e: z.output<typeof evidenceIsi>, ctx: z.RefinementCtx) => {
  if (e.sourceDocumentId != null && e.pageRef == null)
    ctx.addIssue({
      code: 'custom',
      path: ['pageRef'],
      message: 'Halaman PDF wajib diisi bila ada dokumen sumber.',
    });
  if (e.sourceDocumentId == null && e.pageRef != null)
    ctx.addIssue({
      code: 'custom',
      path: ['pageRef'],
      message: 'Halaman PDF hanya diisi bila ada dokumen sumber.',
    });
  if (e.sourceDocumentId == null && !e.cakupanPencarian)
    ctx.addIssue({
      code: 'custom',
      path: ['cakupanPencarian'],
      message: 'Tanpa dokumen sumber, cakupan pencarian wajib diisi.',
    });
};
export const evidenceBodySchema = evidenceIsi
  .extend({ daerahKode: z.string().min(1).max(20), programKode: z.string().min(1).max(50) })
  .superRefine(cekBukti);
/** Editing keeps the program and region; only the evidence itself changes. */
export const evidenceUpdateSchema = evidenceIsi.superRefine(cekBukti);

export const sumberBodySchema = z.object({
  daerahKode: z.string().min(1).max(20),
  title: z.string().trim().min(1).max(300),
  type: z.enum(JENIS_DOKUMEN),
  url: z.url({ protocol: /^https?$/ }).nullable(),
  version: z.string().trim().min(1).max(200),
  checkedAt: tanggal,
});

// Region slugs are top-level URL segments, so they must not shadow fixed routes.
const SLUG_TERPAKAI = ['admin', 'api', 'program', 'pelacak', 'metodologi', 'netralitas', '_next'];
const kodeWilayah = z
  .string()
  .trim()
  .regex(/^\d{2}(\.\d{2})?$/, 'Kode wilayah: dua angka (provinsi) atau 31.71 (kabupaten/kota).');
const ubahDaerah = z.object({
  nama: z.string().trim().min(1).max(200),
  statusKurasi: z.enum(['BELUM_DIKURASI', 'AKTIF']),
  ppidUrl: z.url({ protocol: /^https?$/ }).nullable(),
  ppidEmail: z.email().nullable(),
});
export const daerahBodySchema = ubahDaerah.extend({
  kode: kodeWilayah,
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug: huruf kecil, angka, dan tanda hubung.')
    .refine((s) => !SLUG_TERPAKAI.includes(s), 'Slug ini dipakai halaman lain.'),
  tingkat: z.enum(['PROVINSI', 'KABUPATEN', 'KOTA']),
  indukKode: kodeWilayah.nullable(),
});
export const daerahUpdateSchema = ubahDaerah.partial();

export const auditListSchema = z.object({
  data: z.array(
    z.object({
      id: z.number().int(),
      userEmail: z.string(),
      aksi: z.string(),
      target: z.string(),
      detail: z.unknown(),
      createdAt: z.string(),
    }),
  ),
});

export const verifiedBodySchema = z.object({ verified: z.boolean() });

export const adminSessionSchema = z
  .object({ user: z.object({ name: z.string(), email: z.string() }) })
  .nullable();

export type ProgramList = z.infer<typeof programListSchema>;
export type ProgramDetail = z.infer<typeof programDetailSchema>;
export type BidangUrusanList = z.infer<typeof bidangUrusanListSchema>;
export type SumberList = z.infer<typeof sumberListSchema>;
export type ApiError = z.infer<typeof errorSchema>;
