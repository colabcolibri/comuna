import { describe, expect, it } from 'vitest';
import { createCityDirectory, MIN_CITY_QUERY } from './city-directory';
import type { CityDirectory } from './city-directory';

describe('city directory port', () => {
  it('does not call the adapter under the min query length', async () => {
    let calls = 0;
    const adapter: CityDirectory = {
      search: async () => {
        calls += 1;
        return [];
      },
    };
    const directory = createCityDirectory(adapter, async () => undefined);
    await directory.search('s');
    expect(MIN_CITY_QUERY).toBe(2);
    expect(calls).toBe(0);
  });

  it('forwards a real query to the adapter', async () => {
    const adapter: CityDirectory = {
      search: async (query) => [
        {
          provider: 'nominatim',
          osm_id: 1,
          osm_type: 'relation',
          lat: '0',
          lon: '0',
          country_code: 'BR',
          label: { 'pt-BR': query, en: query },
          hint: query,
        },
      ],
    };
    const directory = createCityDirectory(adapter, async () => undefined);
    const rows = await directory.search('sao paulo');
    expect(rows[0].osm_id).toBe(1);
  });
});
