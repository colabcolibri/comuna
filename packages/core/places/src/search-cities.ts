import { createCityDirectory, type CityDirectory } from './city-directory';
import { createMinIntervalGate } from './min-interval';
import { createNominatimCityDirectory } from './nominatim';

export function createDefaultCityDirectory(deps: { fetchImpl?: typeof fetch; waitForSlot?: () => Promise<void> } = {}): CityDirectory {
  return createCityDirectory(
    createNominatimCityDirectory({ fetchImpl: deps.fetchImpl }),
    deps.waitForSlot || createMinIntervalGate(1100)
  );
}

const defaultDirectory = createDefaultCityDirectory();

export function searchCities(query: string) {
  return defaultDirectory.search(query);
}
