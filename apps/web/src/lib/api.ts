// Server-only: API_BASE_URL is not a NEXT_PUBLIC_ variable, so it never reaches the browser.
import { errorSchema } from '@jejakjanji/shared';
import type { z } from 'zod';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; pesan: string };

/** GET from apps/api and validate with zod. Never throws; failures carry an Indonesian message. */
export async function apiGet<S extends z.ZodType>(
  path: string,
  schema: S,
): Promise<ApiResult<z.output<S>>> {
  const base = process.env.API_BASE_URL;
  if (!base) return { ok: false, status: 0, pesan: 'API_BASE_URL belum diatur di server web.' };

  let res: Response;
  try {
    res = await fetch(new URL(path, base), { cache: 'no-store' });
  } catch {
    return { ok: false, status: 0, pesan: 'Server data tidak dapat dihubungi. Coba lagi nanti.' };
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = errorSchema.safeParse(json);
    return {
      ok: false,
      status: res.status,
      pesan: err.success ? err.data.error.pesan : `Server data mengembalikan status ${res.status}.`,
    };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error(`Respons ${path} tidak sesuai skema`, parsed.error.issues);
    return { ok: false, status: res.status, pesan: 'Format data dari server tidak sesuai.' };
  }
  return { ok: true, data: parsed.data };
}
