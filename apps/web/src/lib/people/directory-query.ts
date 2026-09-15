export function directoryQueryString(
  search: string,
  facets: Record<string, string>,
  cohort = '',
  status = '',
  page = 1
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
  if (page > 1) {
    params.set('page', String(page));
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
