import { DEFAULT_LIST_RADIUS_KM, parseCountryCode, parseListRadius, parseNearLatLon } from '@community/places';
import { SHOWCASE_PAGE_SIZE } from '@community/directory';

export type ListQueryExtras = {
  country?: string;
  near?: string;
  radius?: number;
  view?: string;
  nearLabel?: string;
};

export function directoryQueryString(
  search: string,
  facets: Record<string, string>,
  cohort = '',
  status = '',
  page = 1,
  size = SHOWCASE_PAGE_SIZE,
  extras: ListQueryExtras = {}
) {
  const params = new URLSearchParams();
  const term = search.trim();
  if (term) {
    params.set('search', term);
  }
  Object.entries(facets).forEach(([name, value]) => {
    if (value) {
      params.set(`attr.${name}`, value);
    }
  });
  if (cohort) {
    params.set('cohort', cohort);
  }
  if (status) {
    params.set('status', status);
  }
  const country = parseCountryCode(extras.country || '');
  if (country) {
    params.set('country', country);
  }
  const near = parseNearLatLon(extras.near || '');
  if (near) {
    params.set('near', `${near.lat},${near.lon}`);
    params.set('radius', String(parseListRadius(String(extras.radius || '')) ?? DEFAULT_LIST_RADIUS_KM));
    const label = (extras.nearLabel || '').trim();
    if (label) {
      params.set('near_label', label);
    }
  }
  if (extras.view === 'map') {
    params.set('view', 'map');
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  if (size !== SHOWCASE_PAGE_SIZE) {
    params.set('size', String(size));
  }
  return params.toString();
}

export function parseListPage(params: URLSearchParams) {
  return Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
}

export function activeFilterCount(facets: Record<string, string>, extras: string[] = []) {
  return Object.values(facets).filter(Boolean).length + extras.filter(Boolean).length;
}

export function facetsFromSearchParams(params: URLSearchParams) {
  const next: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key.startsWith('attr.') && value) {
      next[key.slice(5)] = value;
    }
  });
  return next;
}

export function searchParamsFromRecord(raw: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          params.append(key, item);
        }
      });
      return;
    }
    if (value) {
      params.set(key, value);
    }
  });
  return params;
}

export function extrasFromSearchParams(params: URLSearchParams): ListQueryExtras {
  const near = parseNearLatLon(params.get('near'));
  const radius = parseListRadius(params.get('radius'));
  return {
    country: parseCountryCode(params.get('country')) || '',
    near: near ? `${near.lat},${near.lon}` : '',
    radius: near ? radius ?? DEFAULT_LIST_RADIUS_KM : undefined,
    view: params.get('view') === 'map' ? 'map' : '',
    nearLabel: near ? (params.get('near_label') || '').trim() : '',
  };
}
