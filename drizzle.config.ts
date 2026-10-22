import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the real environment.
}
if (!process.env.DATABASE_URL)
  throw new Error('DATABASE_URL belum diisi. Salin .env.example ke .env.');

export default defineConfig({
  schema: './packages/shared/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
});
