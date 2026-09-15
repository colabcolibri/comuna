import { listCommunityModuleStates, setCommunityModuleEnabled, UnknownModuleError } from './set-enabled';

describe('setCommunityModuleEnabled', () => {
  it('throws when the slug is not in plugin_core.modules', async () => {
    const query = async (sql: string) => {
      if (sql.includes('network_core.communities')) {
        return { rows: [{ id: 'c1' }] };
      }
      return { rows: [] };
    };
    await expect(setCommunityModuleEnabled(query, 'c1', 'nope', false)).rejects.toBeInstanceOf(UnknownModuleError);
  });

  it('inserts enabled for a known module', async () => {
    const calls: unknown[][] = [];
    const query = async (sql: string, params: unknown[] = []) => {
      calls.push(params);
      if (sql.includes('network_core.communities')) {
        return { rows: [{ id: 'c1' }] };
      }
      if (sql.includes('plugin_core.modules')) {
        return { rows: [{ id: 'mod-1' }] };
      }
      return { rows: [] };
    };
    await expect(setCommunityModuleEnabled(query, 'c1', 'directory', true)).resolves.toEqual({ enabled: true });
    expect(calls.at(-1)).toEqual(['c1', 'mod-1', true]);
  });
});

describe('listCommunityModuleStates', () => {
  it('returns enabled flags for the requested slugs', async () => {
    const query = async () => ({
      rows: [
        { slug: 'directory', enabled: true },
        { slug: 'showcase', enabled: false },
      ],
    });
    await expect(listCommunityModuleStates(query, 'c1', ['directory', 'showcase'])).resolves.toEqual([
      { slug: 'directory', enabled: true },
      { slug: 'showcase', enabled: false },
    ]);
  });
});
