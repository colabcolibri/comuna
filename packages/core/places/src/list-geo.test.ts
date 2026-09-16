import { describe, expect, it } from 'vitest';
import { DEFAULT_LIST_RADIUS_KM, formatListRadiusKm, formatNearLatLon, legacyPlaceFromNear, parseCountryCode, parseListRadius, parseNearLatLon } from './list-geo';

describe('list geo helpers', () => {
  it('accepts ISO country codes and drops junk', () => {
    expect(parseCountryCode('br')).toBe('BR');
    expect(parseCountryCode('xx')).toBe('XX');
    expect(parseCountryCode('bra')).toBeNull();
    expect(parseCountryCode('')).toBeNull();
  });

  it('only allows the closed radius set', () => {
    expect(parseListRadius('50')).toBe(DEFAULT_LIST_RADIUS_KM);
    expect(parseListRadius('12')).toBeNull();
    expect(parseListRadius('250')).toBe(250);
    expect(parseListRadius('3000')).toBe(3000);
    expect(parseListRadius('2000')).toBeNull();
    expect(formatListRadiusKm(1000, 'pt-BR')).toBe('1.000 km');
  });

  it('parses a near pair and rejects out of range', () => {
    expect(parseNearLatLon('38.72,-9.14')).toEqual({ lat: 38.72, lon: -9.14 });
    expect(parseNearLatLon('91,0')).toBeNull();
    expect(parseNearLatLon('1')).toBeNull();
    expect(formatNearLatLon(38.72, -9.14)).toBe('38.72,-9.14');
    expect(legacyPlaceFromNear('38.72,-9.14', 'Lisboa', 'pt')?.provider).toBe('legacy');
  });
});
