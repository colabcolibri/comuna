import type { GeoPlace, PlaceLocale } from './geo-place';

export const LIST_RADIUS_MIN_KM = 25;
export const LIST_RADIUS_MAX_KM = 3000;
export const LIST_RADIUS_STEP_KM = 25;
export const DEFAULT_LIST_RADIUS_KM = 50;

export function parseCountryCode(raw: string | null | undefined): string | null {
  const value = String(raw || '')
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(value) ? value : null;
}

export function parseListRadius(raw: string | null | undefined): number | null {
  const n = Number.parseInt(raw || '', 10);
  if (!Number.isFinite(n) || n < LIST_RADIUS_MIN_KM || n > LIST_RADIUS_MAX_KM) {
    return null;
  }
  return Math.round(n / LIST_RADIUS_STEP_KM) * LIST_RADIUS_STEP_KM;
}

export function parseNearLatLon(raw: string | null | undefined): { lat: number; lon: number } | null {
  const parts = String(raw || '').split(',');
  if (parts.length !== 2) {
    return null;
  }
  const lat = Number.parseFloat(parts[0] || '');
  const lon = Number.parseFloat(parts[1] || '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  return { lat, lon };
}

export function placeLatLon(place: GeoPlace | null | undefined): { lat: number; lon: number } | null {
  if (!place) {
    return null;
  }
  return parseNearLatLon(`${place.lat},${place.lon}`);
}

export function formatNearLatLon(lat: number, lon: number) {
  return `${lat},${lon}`;
}

export function formatListRadiusKm(km: number, locale: PlaceLocale) {
  return `${new Intl.NumberFormat(locale).format(km)} km`;
}

export function legacyPlaceFromNear(near: string, label: string, country?: string): GeoPlace | null {
  const coords = parseNearLatLon(near);
  if (!coords) {
    return null;
  }
  const text = label.trim() || formatNearLatLon(coords.lat, coords.lon);
  const code = parseCountryCode(country) || '';
  return {
    provider: 'legacy',
    osm_id: 0,
    osm_type: '',
    lat: String(coords.lat),
    lon: String(coords.lon),
    country_code: code,
    label: { 'pt-BR': text, en: text },
  };
}
