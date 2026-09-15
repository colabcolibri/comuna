import type { GeoPlace } from './geo-place';

export const MIN_CITY_QUERY = 2;

export type CitySearchHit = GeoPlace & { hint: string };

export type CityDirectory = {
  search(query: string): Promise<CitySearchHit[]>;
};

export function withMinQuery(inner: CityDirectory, minLength = MIN_CITY_QUERY): CityDirectory {
  return {
    search(query: string) {
      if (query.trim().length < minLength) {
        return Promise.resolve([]);
      }
      return inner.search(query.trim());
    },
  };
}

export function withIntervalGate(inner: CityDirectory, waitForSlot: () => Promise<void>): CityDirectory {
  return {
    async search(query: string) {
      await waitForSlot();
      return inner.search(query);
    },
  };
}

export function createCityDirectory(
  adapter: CityDirectory,
  waitForSlot: () => Promise<void>
): CityDirectory {
  return withMinQuery(withIntervalGate(adapter, waitForSlot));
}
