// Server-only. Asks apps/api whether the request's cookies carry a valid admin session.
// This only decides what to render; every admin write is checked again by the API itself.
import { cookies } from 'next/headers';
import { adminSessionSchema } from '@jejakjanji/shared';

export async function getAdminSession() {
  const base = process.env.API_BASE_URL;
  const cookie = (await cookies()).toString();
  if (!base || !cookie) return null;
  try {
    const res = await fetch(new URL('/api/auth/get-session', base), {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const parsed = adminSessionSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
