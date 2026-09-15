import { enableFirstPartyModules } from './enable-first-party';

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
