import { describe, expect, it } from 'vitest';
import { countryName, displayPlace, displayPlaceLocality, parsePlace, placeLabel, toStoredPlace } from './geo-place';

describe('geo place', () => {
  it('rejects free text arrays', () => {
    expect(parsePlace([{ locale: 'pt-BR', value: 'São Paulo' }])).toBeNull();
  });

  it('stores ids and labels from the geocoder payload', () => {
    const place = parsePlace({
      provider: 'nominatim',
      osm_id: 298285,
      osm_type: 'relation',
      lat: '-23.55',
      lon: '-46.63',
      country_code: 'br',
      label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' },
    });
    expect(place?.osm_id).toBe(298285);
    expect(place?.country_code).toBe('BR');
    expect(placeLabel(place, 'en')).toBe('Sao Paulo');
    expect(placeLabel(place, 'pt-BR')).toBe('São Paulo');
    expect(displayPlace(place, 'pt-BR')).toBe('São Paulo');
    expect(displayPlaceLocality(place, 'pt-BR')).toBe('São Paulo, Brasil');
    expect(displayPlaceLocality(place, 'en')).toBe('Sao Paulo, Brazil');
    expect(countryName('PT', 'pt-BR')).toBe('Portugal');
    expect(toStoredPlace(place!).osm_id).toBe(298285);
  });
});
