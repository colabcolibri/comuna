import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');

const EXPECTED_WORKSPACES = [
  'apps/*',
  'packages/core/*',
  'packages/modules/*',
  'packages/ui/*',
];

const EXPECTED_PACKAGES: { dir: string; name: string }[] = [
  { dir: 'apps/web', name: '@community/web' },
  { dir: 'apps/admin', name: '@community/admin' },
  { dir: 'packages/core/auth', name: '@community/auth' },
  { dir: 'packages/core/db', name: '@community/db' },
  { dir: 'packages/core/identity', name: '@community/identity' },
  { dir: 'packages/core/places', name: '@community/places' },
  { dir: 'packages/core/files', name: '@community/files' },
  { dir: 'packages/core/communities', name: '@community/communities' },
  { dir: 'packages/core/memberships', name: '@community/memberships' },
  { dir: 'packages/core/module-runtime', name: '@community/module-runtime' },
  { dir: 'packages/modules/directory', name: '@community/directory' },
  { dir: 'packages/modules/showcase', name: '@community/showcase' },
  { dir: 'packages/modules/contact-mediated', name: '@community/contact-mediated' },
  { dir: 'packages/ui/primitives', name: '@community/ui' },
  { dir: 'packages/ui/member', name: '@community/ui-member' },
  { dir: 'packages/ui/admin', name: '@community/ui-admin' },
];

function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

describe('monorepo workspaces', () => {
  it('declares pnpm workspace packages', () => {
    const root = readJson('package.json');
    expect(root.packageManager).toMatch(/^pnpm@/);
    expect(root.workspaces).toBeUndefined();
    const yaml = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
    for (const glob of EXPECTED_WORKSPACES) {
      expect(yaml).toContain(glob);
    }
  });

  it('gives each target-tree folder an @community package name', () => {
    for (const entry of EXPECTED_PACKAGES) {
      const pkg = readJson(path.join(entry.dir, 'package.json'));
      expect(pkg.name).toBe(entry.name);
      expect(pkg.private).toBe(true);
    }
  });

  it('does not keep a locale workspace package', () => {
    const yaml = fs.readFileSync(path.join(ROOT, 'pnpm-lock.yaml'), 'utf8');
    expect(yaml).not.toMatch(/packages\/core\/locale/);
    expect(fs.existsSync(path.join(ROOT, 'packages/core/locale'))).toBe(false);
  });

  it('keeps the directory public barrel off postgres', () => {
    const index = fs.readFileSync(path.join(ROOT, 'packages/modules/directory/src/index.ts'), 'utf8');
    const pkg = readJson('packages/modules/directory/package.json');
    expect(index).not.toMatch(/ops-catalog|seed-community-catalog|@community\/db/);
    expect(pkg.exports['./ops']).toBe('./src/ops.ts');
    const ops = fs.readFileSync(path.join(ROOT, 'packages/modules/directory/src/ops.ts'), 'utf8');
    expect(ops).toMatch(/seedCommunityCatalog/);
    expect(ops).toMatch(/listOpsCatalog/);
  });

  it('keeps the Next proxy off the Node-only auth barrel', () => {
    const source = fs.readFileSync(path.join(ROOT, 'apps/web/src/proxy.ts'), 'utf8');
    expect(source).not.toMatch(/from ['"]@community\/auth['"]/);
    expect(source).toMatch(/export async function proxy/);
    expect(source).toMatch(/packages\/core\/auth\/src\/session/);
  });
});
