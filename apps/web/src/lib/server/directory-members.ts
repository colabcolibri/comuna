import { queryAsMember } from '@community/db';
import {
  LIST_FIELDS_SQL,
  directoryContribution,
  listedAttributeNames,
  parseListFields,
  peopleListCountriesQuery,
  peopleListQuery,
  attributeFacets,
} from '@community/directory';
import type { AppQueryCtx } from '@/lib/server/app-ctx';
import { ceilingsFrom, toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';
import { loadOfferingsAsMember, offeringsByMembership } from '@/lib/server/talent-offers';
import {
  parseTalentCategoryFilter,
  talentCeiling,
  talentContribution,
  talentListFiltersEnabled,
} from '@community/talent';

export async function listDirectoryMembers(ctx: AppQueryCtx, searchParams: URLSearchParams) {
  const on = await moduleRuntime.isEnabled(ctx.communityId, directoryContribution.slug);
  if (!on) {
    return { status: 404 as const, body: { error: { code: 'NOT_FOUND', message: 'Módulo desligado' } } };
  }
  const catalog = await queryAsMember(ctx, LIST_FIELDS_SQL, [ctx.communityId, 'directory']);
  const listFields = parseListFields(catalog.rows);
  const talentOn = await moduleRuntime.isEnabled(ctx.communityId, talentContribution.slug);
  const ceilingRow = talentOn
    ? await queryAsMember<{ settings: unknown }>(ctx, `SELECT settings FROM network_core.communities WHERE id = $1`, [ctx.communityId])
    : { rows: [] as { settings: unknown }[] };
  const ceiling = talentCeiling(ceilingRow.rows[0]?.settings);
  const talentFilterEnabled = talentListFiltersEnabled({ talentOn, ceiling, surface: 'directory' });
  const built = peopleListQuery({
    communityId: ctx.communityId,
    searchParams,
    fields: listFields,
    scope: 'directory',
    talentAudiences: talentFilterEnabled ? ['internal', 'external'] : [],
    talentCategory: talentFilterEnabled ? parseTalentCategoryFilter(searchParams.get('talent_category')) : '',
  });
  if (built.ok === false) {
    return { status: 400 as const, body: { error: { code: 'VALIDATION_ERROR', message: built.message } } };
  }
  const counted = built.countText
    ? await queryAsMember<{ total: number }>(ctx, built.countText, built.countParams)
    : { rows: [{ total: 0 }] };
  const result = await queryAsMember(ctx, built.text, built.params);
  const rows = talentOn
    ? await offeringsByMembership(
        result.rows as Record<string, unknown>[],
        'internal',
        loadOfferingsAsMember(ctx),
        ceiling
      )
    : result.rows;
  const countriesQuery = peopleListCountriesQuery({ communityId: ctx.communityId, scope: 'directory' });
  const countries = await queryAsMember<{ country: string }>(ctx, countriesQuery.text, countriesQuery.params);
  const keys = listedAttributeNames(listFields);
  return {
    status: 200 as const,
    body: {
      data: (rows as Record<string, unknown>[]).map((row) => toPersonCard(row, keys, 'internal', ceilingsFrom(listFields))),
      facets: attributeFacets(listFields),
      listFields,
      countries: countries.rows.map((row) => row.country).filter(Boolean),
      meta: {
        page: built.page,
        pageSize: built.pageSize,
        total: counted.rows[0]?.total ?? 0,
        talentFilterEnabled,
      },
    },
  };
}
