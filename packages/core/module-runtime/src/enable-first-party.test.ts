import { FIRST_PARTY_SLUGS } from './is-enabled';
import { enableFirstPartyModules } from './enable-first-party';

describe('enableFirstPartyModules', () => {
  it('inserts only first-party slugs as enabled', async () => {
    const calls: { sql: string; params: unknown[] }[] = [];
    await enableFirstPartyModules(async (sql, params = []) => {
      calls.push({ sql, params });
    }, 'community-1');
    expect(FIRST_PARTY_SLUGS).toEqual(['directory', 'showcase', 'contact-mediated']);
    const enable = calls.find((item) => item.sql.includes('community_modules'));
    expect(enable?.params[0]).toBe('community-1');
    expect(enable?.params[1]).toEqual([...FIRST_PARTY_SLUGS]);
  });
});
