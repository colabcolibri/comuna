import { queryAsMember } from '@community/db';
import {
  LIST_FIELDS_SQL,
  availabilityIsFilterable,
  directoryContribution,
  listedAttributeNames,
  parseListFields,
  peopleListQuery,
  attributeFacets,
} from '@community/directory';
import type { AppQueryCtx } from '@/lib/server/app-ctx';
import { toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';

export async function listDirectoryMembers(ctx: AppQueryCtx, searchParams: URLSearchParams) {
  const on = await moduleRuntime.isEnabled(ctx.communityId, directoryContribution.slug);
  if (!on) {
    return { status: 404 as const, body: { error: { code: 'NOT_FOUND', message: 'Módulo desligado' } } };
  }
  const catalog = await queryAsMember(ctx, LIST_FIELDS_SQL, [ctx.communityId, 'directory']);
  const listFields = parseListFields(catalog.rows);
  const built = peopleListQuery({
    communityId: ctx.communityId,
    searchParams,
    fields: listFields,
    scope: 'directory',
  });
  if (built.ok === false) {
    return { status: 400 as const, body: { error: { code: 'VALIDATION_ERROR', message: built.message } } };
  }
  const result = await queryAsMember(ctx, built.text, built.params);
  const keys = listedAttributeNames(listFields);
  return {
    status: 200 as const,
    body: {
      data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>, keys)),
      facets: attributeFacets(listFields),
      listFields,
      availabilityFilter: availabilityIsFilterable(listFields),
      meta: { page: 1 },
    },
  };
}
