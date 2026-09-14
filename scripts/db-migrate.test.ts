import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { classifyMigrations, listMigrationIds } = require('./db-migrate.cjs');

describe('migration status classifier', () => {
  it('splits applied versus pending by file id', () => {
    const files = ['20260914233353_core_schemas', '20260915010045_rls_profiles_memberships'];
    const { applied, pending } = classifyMigrations(files, ['20260914233353_core_schemas']);
    expect(applied).toEqual(['20260914233353_core_schemas']);
    expect(pending).toEqual(['20260915010045_rls_profiles_memberships']);
  });

  it('lists dated sql files from db/migrations', () => {
    const ids = listMigrationIds(path.resolve(__dirname, '../db/migrations'));
    expect(ids.every((id: string) => /^\d{14}_/.test(id))).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });
});
