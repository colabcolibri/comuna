import { parseAttrFilters } from './catalog';
import { availabilityIsFilterable, type ListField } from './list-fields';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AVAILABILITY = new Set(['available_for_hire', 'project_partner', 'mentor', 'unavailable']);

export const SHOWCASE_PAGE_SIZES = [24, 48, 96] as const;
export const SHOWCASE_PAGE_SIZE = 24;

function parseShowcasePageSize(raw: string | null) {
  const n = Number.parseInt(raw || '', 10);
  return (SHOWCASE_PAGE_SIZES as readonly number[]).includes(n) ? n : SHOWCASE_PAGE_SIZE;
}

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
  fields: ListField[];
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
  }
  const status = input.searchParams.get('status')?.trim() || '';
  if (AVAILABILITY.has(status) && availabilityIsFilterable(input.fields)) {
    params.push(status);
    clauses.push(`c.availability_status = $${params.length}`);
  }
  const where = `${FROM} WHERE ${clauses.join(' AND ')}`;
  const page = Math.max(1, Number.parseInt(input.searchParams.get('page') || '1', 10) || 1);
  const pageSize = parseShowcasePageSize(input.searchParams.get('size'));
  const offset = (page - 1) * pageSize;
  return {
    ok: true,
    text: `${SELECT} ${where} ORDER BY p.full_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    params: [...params, pageSize, offset],
    countText: `SELECT count(*)::int AS total ${where}`,
    countParams: params,
    page,
    pageSize,
  };
}
