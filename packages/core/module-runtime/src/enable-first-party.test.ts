import { enableFirstPartyModules, insertDisabledModules } from './enable-first-party';

describe('enableFirstPartyModules', () => {
  it('inserts the slugs passed by the registry', async () => {
    const slugs = ['directory', 'showcase', 'contact-mediated'];
    const calls: { sql: string; params: unknown[] }[] = [];
    await enableFirstPartyModules(async (sql, params = []) => {
      calls.push({ sql, params });
    }, 'community-1', slugs);
    const enable = calls.find((item) => item.sql.includes('community_modules'));
    expect(enable?.params[0]).toBe('community-1');
    expect(enable?.params[1]).toEqual(slugs);
  });
});

describe('insertDisabledModules', () => {
  it('inserts opt-in plugins without flipping an existing row', async () => {
    const calls: { sql: string; params: unknown[] }[] = [];
    await insertDisabledModules(async (sql, params = []) => {
      calls.push({ sql, params });
    }, 'community-1', ['map']);
    const insert = calls.find((item) => item.sql.includes('community_modules'));
    expect(insert?.sql).toContain('enabled');
    expect(insert?.sql).toContain('DO NOTHING');
    expect(insert?.params[1]).toEqual(['map']);
  });
});
