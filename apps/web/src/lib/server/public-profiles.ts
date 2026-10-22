import { query } from '@community/db';
import {
  LIST_FIELDS_SQL,
  SHOWCASE_PAGE_SIZE,
  listedAttributeNames,
  parseListFields,
  peopleListCountriesQuery,
  peopleListQuery,
  attributeFacets,
  cohortIsListed,
  type ListField,
} from '@community/directory';
import { showcaseContribution } from '@community/showcase';
import {
  parseTalentCategoryFilter,
  talentCeiling,
  talentContribution,
  talentListFiltersEnabled,
} from '@community/talent';
import { ceilingsFrom, toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';
import { loadOfferingsPublic, offeringsByMembership } from '@/lib/server/talent-offers';
import { publicTalentCategories } from '@/lib/server/talent-categories';
import type { TalentCategory } from '@community/talent';

export async function listPublicListFields(communityId: string): Promise<ListField[]> {
  const result = await query(LIST_FIELDS_SQL, [communityId, 'showcase']);
  return parseListFields(result.rows);
}

export async function listPublicProfiles(communityId: string, searchParams: URLSearchParams = new URLSearchParams()) {
  const emptyMeta = {
    page: 1,
    pageSize: SHOWCASE_PAGE_SIZE,
    total: 0,
    talentFilterEnabled: false,
    talentCategories: [] as { id: string; label: unknown; allowsOtherText: boolean }[],
  };
  const on = await moduleRuntime.isEnabled(communityId, showcaseContribution.slug);
  if (!on) {
    return { status: 404 as const, data: [], facets: [], listFields: [] as ListField[], meta: emptyMeta };
  }
  const listFields = await listPublicListFields(communityId);
  const facets = attributeFacets(listFields);
  const keys = listedAttributeNames(listFields);
  const talentOn = await moduleRuntime.isEnabled(communityId, talentContribution.slug);
  const ceilingRow = talentOn
    ? await query<{ settings: unknown }>(`SELECT settings FROM network_core.communities WHERE id = $1`, [communityId])
    : { rows: [] as { settings: unknown }[] };
  const ceiling = talentCeiling(ceilingRow.rows[0]?.settings);
  const talentFilterEnabled = talentListFiltersEnabled({ talentOn, ceiling, surface: 'showcase' });
  const talentCategories: TalentCategory[] = talentOn ? await publicTalentCategories(communityId, { enabledOnly: false }) : [];
  const allowedCategoryIds = talentCategories.filter((item) => item.enabled).map((item) => item.id);
  const built = peopleListQuery({
    communityId,
    searchParams,
    fields: listFields,
    scope: 'showcase',
    talentAudiences: talentFilterEnabled ? ['external'] : [],
    talentCategory: talentFilterEnabled
      ? parseTalentCategoryFilter(searchParams.get('talent_category'), allowedCategoryIds)
      : '',
  });
  if (built.ok === false) {
    return {
      status: 400 as const,
      data: [],
      facets,
      listFields,
      meta: emptyMeta,
      message: built.message,
    };
  }
  const counted = built.countText
    ? await query<{ total: number }>(built.countText, built.countParams)
    : { rows: [{ total: 0 }] };
  const result = await query(built.text, built.params);
  const rows = talentOn
    ? await offeringsByMembership(
        result.rows as Record<string, unknown>[],
        'external',
        loadOfferingsPublic(),
        ceiling
      )
    : result.rows;
  const countriesQuery = peopleListCountriesQuery({ communityId, scope: 'showcase' });
  const countries = await query<{ country: string }>(countriesQuery.text, countriesQuery.params);
  return {
    status: 200 as const,
    data: (rows as Record<string, unknown>[]).map((row) =>
      toPersonCard(
        cohortIsListed(listFields) ? row : { ...row, cohort_name: null },
        keys,
        'external',
        ceilingsFrom(listFields)
      )
    ),
    facets,
    listFields,
    countries: countries.rows.map((row) => row.country).filter(Boolean),
    meta: {
      page: built.page,
      pageSize: built.pageSize,
      total: counted.rows[0]?.total ?? 0,
      talentFilterEnabled,
      talentCategories: talentFilterEnabled
        ? talentCategories
            .filter((item) => item.enabled)
            .map((item) => ({ id: item.id, label: item.label, allowsOtherText: item.allowsOtherText }))
        : [],
    },
  };
}
