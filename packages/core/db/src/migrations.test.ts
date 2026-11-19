import { listMigrationFiles, migrationIdFromPath } from './migrations';
import fs from 'fs';
import path from 'path';

describe('migration file discovery', () => {
  it('lists dated sql files from db/migrations without requiring postgres', () => {
    const dir = path.resolve(__dirname, '../../../../db/migrations');
    const files = listMigrationFiles(dir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.includes('20260916020320_core'))).toBe(true);
    expect(migrationIdFromPath(files[0])).toMatch(/^\d{14}_/);
  });

  it('includes referential integrity, RLS on cards/offerings, and performance indexes migration (US-0138)', () => {
    const dir = path.resolve(__dirname, '../../../../db/migrations');
    const files = listMigrationFiles(dir);
    const target = files.find((f) => f.includes('20261119164000_fks_rls_and_indexes'));
    expect(target).toBeDefined();
    const sql = fs.readFileSync(target!, 'utf8');
    expect(sql).toContain('cards_membership_id_fkey');
    expect(sql).toContain('ON DELETE CASCADE');
    expect(sql).toContain('ALTER TABLE plugin_directory.cards ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('ALTER TABLE plugin_talent.offerings ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('users_email_lower_idx');
    expect(sql).toContain('memberships_user_status_idx');
    expect(sql).toContain('profiles_languages_gin');
  });
});
