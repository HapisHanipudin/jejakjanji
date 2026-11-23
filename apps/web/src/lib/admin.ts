// Server-only. Asks apps/api about the signed-in admin, forwarding the request's cookies.
// This only decides what to render; every admin write is checked again by the API itself.
import { cookies } from 'next/headers';
import type { z } from 'zod';
import { adminSessionSchema } from '@jejakjanji/shared';
import type { ApiResult } from './api';

async function getWithCookies<S extends z.ZodType>(
  path: string,
  schema: S,
): Promise<ApiResult<z.output<S>>> {
  const base = process.env.API_BASE_URL;
  if (!base) return { ok: false, status: 0, pesan: 'API_BASE_URL belum diatur di server web.' };
  try {
    const res = await fetch(new URL(path, base), {
      headers: { cookie: (await cookies()).toString() },
      cache: 'no-store',
    });
    if (!res.ok)
      return { ok: false, status: res.status, pesan: `Server mengembalikan status ${res.status}.` };
    const parsed = schema.safeParse(await res.json());
    return parsed.success
      ? { ok: true, data: parsed.data }
      : { ok: false, status: res.status, pesan: 'Format data dari server tidak sesuai.' };
  } catch {
    return { ok: false, status: 0, pesan: 'Server data tidak dapat dihubungi. Coba lagi nanti.' };
  }
}

export async function getAdminSession() {
  const result = await getWithCookies('/api/auth/get-session', adminSessionSchema);
  return result.ok ? result.data : null;
}

export const adminGet = getWithCookies;
