/**
 * Sets a new password for an admin who forgot theirs and signs them out everywhere. There is no
 * email reset: the site sends no email. Run:
 *   ADMIN_PASSWORD=... bun run admin:reset-password <email>
 * Admins who know their password change it on /admin/akun instead.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createAuth } from '../apps/api/src/auth.ts';

async function main() {
  const [email] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;
  const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = process.env;
  if (!email || !password)
    throw new Error('Pakai: ADMIN_PASSWORD=... bun run admin:reset-password <email>');
  if (password.length < 12) throw new Error('Kata sandi minimal 12 karakter.');
  if (!DATABASE_URL || !BETTER_AUTH_SECRET || !BETTER_AUTH_URL)
    throw new Error(
      'DATABASE_URL, BETTER_AUTH_SECRET, dan BETTER_AUTH_URL wajib diisi. Lihat .env.example.',
    );

  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const auth = createAuth(drizzle(pool), {
      secret: BETTER_AUTH_SECRET,
      baseURL: BETTER_AUTH_URL,
      trustedOrigins: [],
    });
    const ctx = await auth.$context;
    const found = await ctx.internalAdapter.findUserByEmail(email);
    if (!found) throw new Error(`Admin ${email} tidak ditemukan.`);
    await ctx.internalAdapter.updatePassword(found.user.id, await ctx.password.hash(password));
    await ctx.internalAdapter.deleteUserSessions(found.user.id);
    console.log(`Kata sandi ${found.user.email} diganti; semua sesinya dikeluarkan.`);
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
