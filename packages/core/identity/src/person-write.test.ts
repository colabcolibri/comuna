import { describe, expect, it } from 'vitest';
import { personWriteFromBody } from './person-write';

describe('person write', () => {
  it('maps a geocoded city onto country codes', () => {
    const result = personWriteFromBody({
      full_name: 'Ana Silva',
      gender: 'woman',
      current_city: {
        provider: 'nominatim',
        osm_id: 298285,
        osm_type: 'relation',
        lat: '-23.55',
        lon: '-46.63',
        country_code: 'BR',
        label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' },
      },
      languages: [{ code: 'pt', proficiency: 'native' }],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.write.current_country).toBe('BR');
    expect(result.write.current_city?.osm_id).toBe(298285);
  });

  it('requires full_name', () => {
    expect(personWriteFromBody({}).ok).toBe(false);
  });
});
