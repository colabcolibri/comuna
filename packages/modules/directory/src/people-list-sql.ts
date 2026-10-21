import { DEFAULT_LIST_RADIUS_KM, parseCountryCode, parseListRadius, parseNearLatLon } from '@community/places';
import { parseAttrFilters } from './catalog';
import { languagesIsFilterable, parseLanguageFilter } from './language-filter';
import { directoryScopeSql, showcaseScopeSql } from './audience';
import type { ListField } from './list-fields';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SHOWCASE_PAGE_SIZES = [24, 48, 96] as const;
export const SHOWCASE_PAGE_SIZE = 24;
export const MAP_PIN_LIMIT = 5000;

function parseShowcasePageSize(raw: string | null) {
  const n = Number.parseInt(raw || '', 10);
  return (SHOWCASE_PAGE_SIZES as readonly number[]).includes(n) ? n : SHOWCASE_PAGE_SIZE;
}

const SELECT = `SELECT m.id, p.full_name, p.avatar_url, p.current_city, p.languages, p.contacts, c.headline, c.bio, c.headline_audience, c.bio_audience, c.attribute_audience, c.custom_attributes`;
const FROM = `FROM network_core.memberships m JOIN person_core.profiles p ON p.user_id = m.user_id JOIN plugin_directory.cards c ON c.membership_id = m.id`;
const COORD = `pg_input_is_valid(p.current_city->>'lat', 'float8') AND pg_input_is_valid(p.current_city->>'lon', 'float8')`;

function haversineKm(latSlot: number, lonSlot: number) {
  return `6371 * acos(LEAST(1.0, GREATEST(-1.0, cos(radians($${latSlot}::float)) * cos(radians((p.current_city->>'lat')::float)) * cos(radians((p.current_city->>'lon')::float) - radians($${lonSlot}::float)) + sin(radians($${latSlot}::float)) * sin(radians((p.current_city->>'lat')::float)))))`;
}

function scopeClauses(scope: PeopleListScope) {
  return scope === 'directory'
    ? [`m.network_status = 'active'`, directoryScopeSql('c')]
    : [showcaseScopeSql('c')];
}

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
  talentAudiences?: string[];
  talentCategory?: string | null;
}): PeopleListQuery | { ok: false; message: string } {
  const parsed = parseAttrFilters(input.searchParams, input.fields);
  if (parsed.ok === false) {
    return parsed;
  }
  const clauses = ['m.community_id = $1', ...scopeClauses(input.scope)];
  const params: unknown[] = [input.communityId];
  parsed.filters.forEach((filter) => {
    params.push(JSON.stringify(filter));
    clauses.push(`c.custom_attributes @> $${params.length}::jsonb`);
  });
  const audiences = input.talentAudiences?.filter(Boolean) || [];
  const search = input.searchParams.get('search')?.trim() || '';
  const talentCategory = (input.talentCategory || '').trim();
  const needsTalentBind = audiences.length > 0 && (Boolean(talentCategory) || Boolean(search));
  let talentAudienceSlot: number | null = null;
  if (needsTalentBind) {
    params.push(audiences);
    talentAudienceSlot = params.length;
  }
  if (talentCategory && talentAudienceSlot) {
    params.push(talentCategory);
    clauses.push(
      `EXISTS (SELECT 1 FROM plugin_talent.offerings o WHERE o.membership_id = m.id AND o.audience = ANY($${talentAudienceSlot}::text[]) AND o.category_id = $${params.length})`
    );
  }
  if (search) {
    params.push(`%${search}%`);
    const searchSlot = params.length;
    const talent =
      talentAudienceSlot
        ? ` OR EXISTS (SELECT 1 FROM plugin_talent.offerings o LEFT JOIN plugin_talent.categories cat ON cat.id = o.category_id WHERE o.membership_id = m.id AND o.audience = ANY($${talentAudienceSlot}::text[]) AND (o.title ILIKE $${searchSlot} OR o.description ILIKE $${searchSlot} OR coalesce(o.category_other, '') ILIKE $${searchSlot} OR cat.label::text ILIKE $${searchSlot}))`
        : '';
    clauses.push(
      `(p.full_name ILIKE $${searchSlot} OR c.headline::text ILIKE $${searchSlot} OR c.bio::text ILIKE $${searchSlot}${talent})`
    );
  }
  if (input.scope === 'directory') {
    const cohort = input.searchParams.get('cohort')?.trim() || '';
    if (UUID.test(cohort)) {
      params.push(cohort);
      clauses.push(`m.cohort_id = $${params.length}`);
    }
  }
  if (languagesIsFilterable(input.fields)) {
    for (const code of parseLanguageFilter(input.searchParams.get('lang'))) {
      params.push(JSON.stringify([{ code }]));
      clauses.push(`p.languages @> $${params.length}::jsonb`);
    }
  }
  const country = parseCountryCode(input.searchParams.get('country'));
  if (country) {
    params.push(country);
    clauses.push(`p.current_country = $${params.length}`);
  }
  const near = parseNearLatLon(input.searchParams.get('near'));
  if (near) {
    const radius = parseListRadius(input.searchParams.get('radius')) ?? DEFAULT_LIST_RADIUS_KM;
    params.push(near.lat);
    const latSlot = params.length;
    params.push(near.lon);
    const lonSlot = params.length;
    params.push(radius);
    const radiusSlot = params.length;
    clauses.push(COORD);
    clauses.push(`${haversineKm(latSlot, lonSlot)} <= $${radiusSlot}`);
  }
  const where = `${FROM} WHERE ${clauses.join(' AND ')}`;
  const mapView = input.searchParams.get('view') === 'map';
  const page = mapView ? 1 : Math.max(1, Number.parseInt(input.searchParams.get('page') || '1', 10) || 1);
  const pageSize = mapView ? MAP_PIN_LIMIT : parseShowcasePageSize(input.searchParams.get('size'));
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

export function peopleListCountriesQuery(input: { communityId: string; scope: PeopleListScope }) {
  const clauses = ['m.community_id = $1', ...scopeClauses(input.scope), `p.current_country SIMILAR TO '[A-Z]{2}'`];
  return {
    text: `SELECT DISTINCT p.current_country AS country ${FROM} WHERE ${clauses.join(' AND ')} ORDER BY 1`,
    params: [input.communityId],
  };
}
