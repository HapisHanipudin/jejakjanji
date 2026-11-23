import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  adminAccount,
  adminRateLimit,
  adminSession,
  adminUser,
  adminVerification,
} from '@jejakjanji/shared';
import { hashPassword, verifyPassword } from './password.ts';

export type AuthConfig = {
  secret: string;
  /** Public origin the browser sees: the web app, which proxies /api/auth to this Worker. */
  baseURL: string;
  trustedOrigins: string[];
  /** Only scripts/create-admin.ts sets this. The HTTP API never allows sign-up. */
  allowSignUp?: boolean;
};

/**
 * Built per request: a Worker cannot keep a pg connection across requests, so the auth instance
 * cannot live at module scope (https://better-auth.com/docs/guides/cloudflare).
 * Every account in admin_user is a curator; there are no roles and no visitor accounts.
 */
export function createAuth(db: NodePgDatabase, config: AuthConfig) {
  return betterAuth({
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: config.trustedOrigins,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: adminUser,
        session: adminSession,
        account: adminAccount,
        verification: adminVerification,
        rateLimit: adminRateLimit,
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !config.allowSignUp,
      minPasswordLength: 12,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    // Counters live in Postgres so every isolate shares them. Sign-in is the expensive route
    // (password hashing), so it gets the tightest limit; this also keeps CPU overruns rare.
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 300, max: 5 },
        '/change-password': { window: 300, max: 5 },
      },
    },
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
  });
}
