import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('demo talent seed', () => {
  it('upserts three stable example offers only for the demo community', () => {
    const source = fs.readFileSync(path.join(import.meta.dirname, '../../../../scripts/seed/talent-demo.cjs'), 'utf8');
    expect(source).toContain('seed:external');
    expect(source).toContain('seed:internal');
    expect(source).toContain('seed:private');
    expect(source).toContain('tenants.demo');
    expect(source).toContain('ON CONFLICT (membership_id, seed_key)');
  });
});
