import { query } from '@community/db';
import {
  LIST_FIELDS_SQL,
  SHOWCASE_PAGE_SIZE,
  availabilityIsFilterable,
  listedAttributeNames,
  parseListFields,
  peopleListCountriesQuery,
  peopleListQuery,
  attributeFacets,
  type ListField,
} from '@community/directory';
import { showcaseContribution } from '@community/showcase';
import { toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';

export async function listPublicListFields(communityId: string): Promise<ListField[]> {
  const result = await query(LIST_FIELDS_SQL, [communityId, 'showcase']);
  return parseListFields(result.rows);
}

export async function listPublicProfiles(communityId: string, searchParams: URLSearchParams = new URLSearchParams()) {
  const emptyMeta = { page: 1, pageSize: SHOWCASE_PAGE_SIZE, total: 0 };
  const on = await moduleRuntime.isEnabled(communityId, showcaseContribution.slug);
  if (!on) {
    return { status: 404 as const, data: [], facets: [], listFields: [] as ListField[], meta: emptyMeta };
  }
  const listFields = await listPublicListFields(communityId);
  const facets = attributeFacets(listFields);
  const keys = listedAttributeNames(listFields);
  const built = peopleListQuery({
    communityId,
    searchParams,
    fields: listFields,
    scope: 'showcase',
  });
  if (built.ok === false) {
    return {
      status: 400 as const,
      data: [],
      facets,
      listFields,
      availabilityFilter: availabilityIsFilterable(listFields),
      meta: emptyMeta,
      message: built.message,
    };
  }
  const counted = built.countText
    ? await query<{ total: number }>(built.countText, built.countParams)
    : { rows: [{ total: 0 }] };
  const result = await query(built.text, built.params);
  const countriesQuery = peopleListCountriesQuery({ communityId, scope: 'showcase' });
  const countries = await query<{ country: string }>(countriesQuery.text, countriesQuery.params);
  return {
    status: 200 as const,
    data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>, keys)),
    facets,
    listFields,
    availabilityFilter: availabilityIsFilterable(listFields),
    countries: countries.rows.map((row) => row.country).filter(Boolean),
    meta: { page: built.page, pageSize: built.pageSize, total: counted.rows[0]?.total ?? 0 },
  };
}
