import { z } from 'zod';

export const STORAGE_KEY = 'jejakjanji.pelacak';

export const STATUS_PERMOHONAN = ['belum_dijawab', 'dijawab', 'ditolak', 'diperpanjang'] as const;
export type StatusPermohonan = (typeof STATUS_PERMOHONAN)[number];
export const STATUS_LABEL: Record<StatusPermohonan, string> = {
  belum_dijawab: 'Belum dijawab',
  dijawab: 'Dijawab',
  ditolak: 'Ditolak',
  diperpanjang: 'Diperpanjang',
};

export const PERANGKAT_DAERAH_MAX = 120;

export const permohonanSchema = z.object({
  id: z.string().min(1).max(64),
  programKode: z.string().min(1).max(32),
  programNama: z.string().min(1).max(300),
  perangkatDaerah: z.string().trim().min(1).max(PERANGKAT_DAERAH_MAX),
  tanggalKirim: z.iso.date(),
  status: z.enum(STATUS_PERMOHONAN),
});
export type Permohonan = z.infer<typeof permohonanSchema>;

// Bump `versi` and add a migration when the shape changes.
export const simpananSchema = z.object({
  versi: z.literal(1),
  permohonan: z.array(permohonanSchema).max(500),
});
export type Simpanan = z.infer<typeof simpananSchema>;

export const kosong = (): Simpanan => ({ versi: 1, permohonan: [] });

/** Parses stored or imported JSON. Never throws: bad data comes back as ok: false. */
export function bacaSimpanan(raw: string | null): { ok: true; data: Simpanan } | { ok: false } {
  if (raw == null) return { ok: true, data: kosong() };
  try {
    const r = simpananSchema.safeParse(JSON.parse(raw));
    return r.success ? { ok: true, data: r.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}
