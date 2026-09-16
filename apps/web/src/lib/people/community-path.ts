export function memberPostLoginPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/login')) {
    return '/';
  }
  if (next === '/showcase' || next.startsWith('/showcase?') || next.startsWith('/showcase/')) {
    return '/';
  }
  const showcase = next.match(/^\/c\/([^/]+)\/showcase(?:\/|\?|$)/);
  if (showcase) {
    return `/c/${showcase[1]}/directory`;
  }
  return next;
}

export function communityPath(slug: string, href: string) {
  const path = href.startsWith('/') ? href : `/${href}`;
  if (path.startsWith('/c/')) {
    return path;
  }
  return `/c/${slug}${path}`;
}

export function slugFromPathname(pathname: string) {
  const match = pathname.match(/^\/c\/([^/]+)/);
  return match?.[1] ?? null;
}

export function jobFromPath(pathname: string) {
  const match = pathname.match(/^\/c\/[^/]+(\/.*)$/);
  return match?.[1] ?? pathname;
}

export function nextJobPath(
  pathname: string,
  targetSlug: string,
  enabled: Iterable<string>,
  isCoordinator: boolean
) {
  const job = jobFromPath(pathname);
  const on = new Set(enabled);
  if (pathname === '/profile' || pathname.startsWith('/profile/')) {
    if (on.has('directory')) {
      return communityPath(targetSlug, '/directory');
    }
    if (on.has('showcase')) {
      return communityPath(targetSlug, '/showcase');
    }
    return communityPath(targetSlug, '/profile');
  }
  if (job.startsWith('/directory') && on.has('directory')) {
    return communityPath(targetSlug, '/directory');
  }
  if (job.startsWith('/showcase') && on.has('showcase')) {
    return communityPath(targetSlug, '/showcase');
  }
  if (job.startsWith('/profile')) {
    return communityPath(targetSlug, '/profile');
  }
  if (job.startsWith('/coord') && isCoordinator) {
    return communityPath(targetSlug, '/coord/approvals');
  }
  if (on.has('directory')) {
    return communityPath(targetSlug, '/directory');
  }
  if (on.has('showcase')) {
    return communityPath(targetSlug, '/showcase');
  }
  return communityPath(targetSlug, '/profile');
}
