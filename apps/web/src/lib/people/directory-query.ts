export function directoryQueryString(search: string, facets: Record<string, string>) {
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
  return params.toString();
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
