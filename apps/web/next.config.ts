import type { NextConfig } from 'next';

// API_BASE_URL lives in the monorepo root .env (see .env.example). The real environment wins.
try {
  process.loadEnvFile('../../.env');
} catch {
  // No root .env: rely on the real environment.
}

const nextConfig: NextConfig = {
  // packages/shared ships TypeScript source, not built JS.
  transpilePackages: ['@jejakjanji/shared'],
  async redirects() {
    return [{ source: '/netralitas', destination: '/metodologi#netralitas', permanent: false }];
  },
};

export default nextConfig;
