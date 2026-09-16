function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function memberSurfaceUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3014');
}

export function opsSurfaceUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_OPS_URL || 'http://localhost:3015');
}
