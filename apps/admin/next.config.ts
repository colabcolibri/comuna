import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

function applyEnvFile(file: string) {
  if (!fs.existsSync(file)) {
    return;
  }
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const monorepoRoot = path.join(__dirname, '../..');
applyEnvFile(path.join(monorepoRoot, '.env'));
applyEnvFile(path.join(monorepoRoot, '.env.local'));

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  transpilePackages: [
    '@community/auth',
    '@community/db',
    '@community/identity',
    '@community/communities',
    '@community/memberships',
    '@community/module-runtime',
    '@community/directory',
    '@community/showcase',
    '@community/contact-mediated',
    '@community/mail',
    '@community/platform',
    '@community/ui',
    '@community/ui-admin',
    'cn',
  ],
};

export default nextConfig;
