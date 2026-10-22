import { z } from 'zod';

// Validation messages in Indonesian (UI and API language).
z.config(z.locales.id());

export const LABEL_PAGU = 'Pagu indikatif, bukan APBD dan bukan realisasi';

const label = z.literal(LABEL_PAGU);
const nilaiStatus = z.enum(['ada', 'belum_diketahui']);
export const statusBuktiSchema = z.object({
  rencana: nilaiStatus,
  anggaran: nilaiStatus,
  pelaksanaan: nilaiStatus,
});

export const programQuerySchema = z.object({
  bidang: z.string().trim().min(1).optional(),
  status: nilaiStatus.optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const sourceDocumentSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  type: z.enum(['RPJMD', 'RKPD']),
  url: z.string().nullable(),
  version: z.string(),
  checkedAt: z.string(),
});

export const bidangUrusanListSchema = z.object({
  label,
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
  data: z.object({
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
  }),
});

export const sumberListSchema = z.object({ data: z.array(sourceDocumentSchema) });

export const errorSchema = z.object({
  error: z.object({ kode: z.string(), pesan: z.string(), detail: z.unknown().optional() }),
});

export type ProgramList = z.infer<typeof programListSchema>;
export type ProgramDetail = z.infer<typeof programDetailSchema>;
export type BidangUrusanList = z.infer<typeof bidangUrusanListSchema>;
export type SumberList = z.infer<typeof sumberListSchema>;
export type ApiError = z.infer<typeof errorSchema>;
