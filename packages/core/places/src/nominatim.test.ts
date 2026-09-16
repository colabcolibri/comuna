import { describe, expect, it } from 'vitest';
import { labelsFromNominatimNames, mapNominatimHit } from './nominatim';

describe('nominatim adapter', () => {
  it('maps namedetails instead of member-typed copy', () => {
    const hit = mapNominatimHit({
      osm_id: 298285,
      osm_type: 'relation',
      lat: '-23.55',
      lon: '-46.63',
      name: 'São Paulo',
      display_name: 'São Paulo, Região Sudeste, Brasil',
      type: 'city',
      namedetails: { 'name:pt': 'São Paulo', 'name:en': 'Sao Paulo' },
      address: { city: 'São Paulo', country_code: 'br' },
    });
    expect(hit?.hint).toContain('Brasil');
    expect(hit?.label.en).toBe('Sao Paulo');
    expect(labelsFromNominatimNames('São Paulo', { 'name:en': 'Sao Paulo' }).en).toBe('Sao Paulo');
  });

  it('keeps the village name when Nominatim nests it under a town', () => {
    const hit = mapNominatimHit({
      osm_id: 3873203,
      osm_type: 'relation',
      lat: '51.24',
      lon: '4.89',
      name: 'Tielen',
      display_name: 'Tielen, Kasterlee, Antwerpen, België',
      type: 'administrative',
      addresstype: 'village',
      namedetails: { name: 'Tielen' },
      address: { village: 'Tielen', town: 'Kasterlee', country_code: 'be' },
    });
    expect(hit?.label['pt-BR']).toBe('Tielen');
    expect(hit?.label.en).toBe('Tielen');
    expect(hit?.hint).toContain('Kasterlee');
  });
});
