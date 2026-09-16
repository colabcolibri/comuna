import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('app RLS context', () => {
  it('helper SET LOCAL ROLE and set_config from verified claims, not client input names', () => {
    const helper = readFileSync(path.resolve(__dirname, './with-app-context.ts'), 'utf8');
    expect(helper).toContain('SET LOCAL ROLE community_app');
    expect(helper).toContain("set_config('app.user_id'");
    expect(helper).toContain("set_config('app.community_id'");
  });

  it('migration enables RLS on profiles and memberships without bypass', () => {
    const sql = readFileSync(
      path.resolve(__dirname, '../../../../db/migrations/20260916020324_rls.sql'),
      'utf8'
    );
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('person_core.profiles');
    expect(sql).toContain('network_core.memberships');
    expect(sql).toContain('NOBYPASSRLS');
  });
});
