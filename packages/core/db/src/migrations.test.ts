import { listMigrationFiles, migrationIdFromPath } from './migrations';
import path from 'path';

describe('migration file discovery', () => {
  it('lists dated sql files from db/migrations without requiring postgres', () => {
    const dir = path.resolve(__dirname, '../../../../db/migrations');
    const files = listMigrationFiles(dir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.includes('20260914233353_core_schemas'))).toBe(true);
    expect(migrationIdFromPath(files[0])).toMatch(/^\d{14}_/);
  });
});
