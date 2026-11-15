import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { adminAccount, adminSession, adminUser, adminVerification } from '@jejakjanji/shared';

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
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !config.allowSignUp,
      minPasswordLength: 12,
    },
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
  });
}
