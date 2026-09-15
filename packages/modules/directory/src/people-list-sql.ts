import type { CatalogField } from './catalog';
import { parseAttrFilters } from './catalog';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AVAILABILITY = new Set(['available_for_hire', 'project_partner', 'mentor', 'unavailable']);

export const SHOWCASE_PAGE_SIZE = 12;

const SELECT = `SELECT m.id, p.full_name, p.avatar_url, p.current_city, p.languages, p.contacts, c.headline, c.bio, c.availability_status, c.custom_attributes`;
const FROM = `FROM network_core.memberships m JOIN person_core.profiles p ON p.user_id = m.user_id JOIN plugin_directory.cards c ON c.membership_id = m.id`;

export type PeopleListScope = 'directory' | 'showcase';

export type PeopleListQuery = {
  ok: true;
  text: string;
  params: unknown[];
  countText?: string;
  countParams?: unknown[];
  page: number;
  pageSize: number;
};

export function peopleListQuery(input: {
  communityId: string;
  searchParams: URLSearchParams;
  fields: CatalogField[];
  scope: PeopleListScope;
}): PeopleListQuery | { ok: false; message: string } {
  const parsed = parseAttrFilters(input.searchParams, input.fields);
  if (parsed.ok === false) {
    return parsed;
  }
  const clauses = ['m.community_id = $1'];
  const params: unknown[] = [input.communityId];
  if (input.scope === 'directory') {
    clauses.push(`m.network_status = 'active'`);
  } else {
    clauses.push('c.public_showcase = true');
  }
  parsed.filters.forEach((filter) => {
    params.push(JSON.stringify(filter));
    clauses.push(`c.custom_attributes @> $${params.length}::jsonb`);
  });
  const search = input.searchParams.get('search')?.trim() || '';
  if (search) {
    params.push(`%${search}%`);
    clauses.push(
      `(p.full_name ILIKE $${params.length} OR c.headline::text ILIKE $${params.length} OR c.bio::text ILIKE $${params.length})`
    );
  }
  if (input.scope === 'directory') {
    const cohort = input.searchParams.get('cohort')?.trim() || '';
    if (UUID.test(cohort)) {
      params.push(cohort);
      clauses.push(`m.cohort_id = $${params.length}`);
    }
  } else {
    const status = input.searchParams.get('status')?.trim() || '';
    if (AVAILABILITY.has(status)) {
      params.push(status);
      clauses.push(`c.availability_status = $${params.length}`);
    }
  }
  const where = `${FROM} WHERE ${clauses.join(' AND ')}`;
  if (input.scope !== 'showcase') {
    return { ok: true, text: `${SELECT} ${where} ORDER BY p.full_name`, params, page: 1, pageSize: 0 };
  }
  const page = Math.max(1, Number.parseInt(input.searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * SHOWCASE_PAGE_SIZE;
  return {
    ok: true,
    text: `${SELECT} ${where} ORDER BY p.full_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    params: [...params, SHOWCASE_PAGE_SIZE, offset],
    countText: `SELECT count(*)::int AS total ${where}`,
    countParams: params,
    page,
    pageSize: SHOWCASE_PAGE_SIZE,
  };
}
