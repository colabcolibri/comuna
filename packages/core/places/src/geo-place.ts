export type GeoPlace = {
  provider: string;
  osm_id: number;
  osm_type: string;
  lat: string;
  lon: string;
  country_code: string;
  label: { 'pt-BR': string; en: string };
};

export type PlaceLocale = keyof GeoPlace['label'];

export function parsePlace(raw: unknown): GeoPlace | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const labelRow = row.label && typeof row.label === 'object' ? (row.label as Record<string, unknown>) : {};
  const pt = String(labelRow['pt-BR'] || '').trim();
  const en = String(labelRow.en || '').trim();
  if (!pt && !en) {
    return null;
  }
  const provider = String(row.provider || 'nominatim');
  const osmId = Number(row.osm_id || 0);
  if (provider !== 'legacy' && !(osmId > 0)) {
    return null;
  }
  const country = String(row.country_code || '')
    .trim()
    .toUpperCase();
  return {
    provider,
    osm_id: osmId,
    osm_type: String(row.osm_type || ''),
    lat: String(row.lat || ''),
    lon: String(row.lon || ''),
    country_code: /^[A-Z]{2}$/.test(country) ? country : '',
    label: { 'pt-BR': pt || en, en: en || pt },
  };
}

export function placeLabel(place: GeoPlace | null | undefined, locale: PlaceLocale): string {
  if (!place) {
    return '';
  }
  return (place.label[locale] || place.label['pt-BR'] || place.label.en || '').trim();
}

export function displayPlace(raw: unknown, locale: PlaceLocale): string {
  return placeLabel(parsePlace(raw), locale);
}

export function placeKey(place: Pick<GeoPlace, 'osm_type' | 'osm_id'>): string {
  return `${place.osm_type}:${place.osm_id}`;
}

export function toStoredPlace(place: GeoPlace): GeoPlace {
  return {
    provider: place.provider,
    osm_id: place.osm_id,
    osm_type: place.osm_type,
    lat: place.lat,
    lon: place.lon,
    country_code: place.country_code,
    label: place.label,
  };
}
