import { parsePlace, placeKey } from './geo-place';
import type { CityDirectory, CitySearchHit } from './city-directory';

const SETTLEMENT_TYPES = new Set(['city', 'town', 'village', 'municipality', 'hamlet', 'suburb']);

type NominatimHit = {
  osm_id?: number;
  osm_type?: string;
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  type?: string;
  addresstype?: string;
  namedetails?: Record<string, string>;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country_code?: string;
  };
};

export function labelsFromNominatimNames(
  name: string,
  namedetails: Record<string, string> | undefined
): { 'pt-BR': string; en: string } {
  const fallback = String(name || '').trim();
  const details = namedetails || {};
  const pt = String(details['name:pt-BR'] || details['name:pt'] || fallback).trim();
  const en = String(details['name:en'] || fallback).trim();
  return { 'pt-BR': pt || en, en: en || pt };
}

export function mapNominatimHit(hit: NominatimHit): CitySearchHit | null {
  const type = String(hit.addresstype || hit.type || '');
  const ownName = String(hit.name || '').trim();
  const localName = SETTLEMENT_TYPES.has(type)
    ? ownName || addressLocality(hit)
    : addressLocality(hit);
  if (!localName) {
    return null;
  }
  const place = parsePlace({
    provider: 'nominatim',
    osm_id: hit.osm_id,
    osm_type: hit.osm_type,
    lat: hit.lat,
    lon: hit.lon,
    country_code: hit.address?.country_code,
    label: labelsFromNominatimNames(localName, hit.namedetails),
  });
  if (!place) {
    return null;
  }
  return { ...place, hint: String(hit.display_name || localName) };
}

function addressLocality(hit: NominatimHit) {
  return (
    hit.address?.village ||
    hit.address?.town ||
    hit.address?.city ||
    hit.address?.municipality ||
    ''
  );
}

export function createNominatimCityDirectory(deps: { fetchImpl?: typeof fetch } = {}): CityDirectory {
  const fetchImpl = deps.fetchImpl || fetch;
  return {
    async search(query: string) {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('namedetails', '1');
      url.searchParams.set('limit', '8');
      url.searchParams.set('q', query);
      const res = await fetchImpl(url.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CommunityPlatform/2.0 (profile city lookup)',
        },
      });
      if (!res.ok) {
        throw new Error('nominatim_unavailable');
      }
      const rows = (await res.json()) as NominatimHit[];
      if (!Array.isArray(rows)) {
        return [];
      }
      const seen = new Set<string>();
      const out: CitySearchHit[] = [];
      for (const hit of rows) {
        const mapped = mapNominatimHit(hit);
        if (!mapped) {
          continue;
        }
        const key = placeKey(mapped);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        out.push(mapped);
      }
      return out;
    },
  };
}
