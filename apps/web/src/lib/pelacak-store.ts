import { z } from 'zod';
import { JAKARTA } from '@jejakjanji/shared';

export const STORAGE_KEY = 'jejakjanji.pelacak';
export const BACKUP_KEY = 'jejakjanji.pelacak.backup';

export const STATUS_PERMOHONAN = ['belum_dijawab', 'dijawab', 'ditolak', 'diperpanjang'] as const;
export type StatusPermohonan = (typeof STATUS_PERMOHONAN)[number];
export const STATUS_LABEL: Record<StatusPermohonan, string> = {
  belum_dijawab: 'Belum dijawab',
  dijawab: 'Dijawab',
  ditolak: 'Ditolak',
  diperpanjang: 'Diperpanjang',
};

export const PERANGKAT_DAERAH_MAX = 120;

const legacyPermohonanSchema = z.object({
  id: z.string().min(1).max(64),
  programKode: z.string().min(1).max(32),
  programNama: z.string().min(1).max(300),
  perangkatDaerah: z.string().trim().min(1).max(PERANGKAT_DAERAH_MAX),
  tanggalKirim: z.iso.date(),
  status: z.enum(STATUS_PERMOHONAN),
});
export const permohonanSchema = legacyPermohonanSchema.extend({
  daerahKode: z.string().min(1).max(32),
  daerahSlug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  daerahNama: z.string().min(1).max(160),
});
export type Permohonan = z.infer<typeof permohonanSchema>;

// Bump `versi` and add a migration when the shape changes.
export const simpananSchema = z
  .object({
    versi: z.literal(2),
    permohonan: z.array(permohonanSchema).max(500),
  })
  .refine(
    (value) => new Set(value.permohonan.map((item) => item.id)).size === value.permohonan.length,
    'ID permohonan duplikat.',
  );
export type Simpanan = z.infer<typeof simpananSchema>;

export const kosong = (): Simpanan => ({ versi: 2, permohonan: [] });

/** Parses stored or imported JSON. Never throws: bad data comes back as ok: false. */
export function bacaSimpanan(raw: string | null): { ok: true; data: Simpanan } | { ok: false } {
  if (raw == null) return { ok: true, data: kosong() };
  try {
    const value: unknown = JSON.parse(raw);
    const legacy = z
      .object({ versi: z.literal(1), permohonan: z.array(legacyPermohonanSchema).max(500) })
      .safeParse(value);
    const r = simpananSchema.safeParse(
      legacy.success
        ? {
            versi: 2,
            permohonan: legacy.data.permohonan.map((item) => ({
              ...item,
              daerahKode: JAKARTA.kode,
              daerahSlug: JAKARTA.slug,
              daerahNama: JAKARTA.nama,
            })),
          }
        : value,
    );
    return r.success ? { ok: true, data: r.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Back up the exact previous bytes before replacing them. Failure never changes UI state. */
export function simpanSimpanan(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  data: Simpanan,
): boolean {
  if (!simpananSchema.safeParse(data).success) return false;
  try {
    const previous = storage.getItem(STORAGE_KEY);
    if (previous !== null) storage.setItem(BACKUP_KEY, previous);
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
