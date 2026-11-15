/**
 * Creates one admin (curator) account. Sign-up is disabled on the HTTP API, so this script is
 * the only way in. Run: ADMIN_PASSWORD=... bun scripts/create-admin.ts <email> <nama>
 * The password comes from the environment so it never lands in shell history as an argument.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createAuth } from '../apps/api/src/auth.ts';

async function main() {
  const [email, ...namaParts] = process.argv.slice(2);
  const name = namaParts.join(' ');
  const password = process.env.ADMIN_PASSWORD;
  const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL } = process.env;
  if (!email || !name || !password)
    throw new Error('Pakai: ADMIN_PASSWORD=... bun scripts/create-admin.ts <email> <nama>');
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
      allowSignUp: true,
    });
    const { user } = await auth.api.signUpEmail({ body: { email, name, password } });
    console.log(`Admin dibuat: ${user.email}`);
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
