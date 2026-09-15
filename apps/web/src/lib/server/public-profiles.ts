import { query } from '@community/db';
import { parseField, peopleListQuery, SHOWCASE_PAGE_SIZE } from '@community/directory';
import { showcaseContribution } from '@community/showcase';
import { toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';

export async function listPublicFacets(communityId: string) {
  const result = await query(
    `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.filterable, f.required, f.span, f.sort_order, f.label, f.enabled
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1 AND g.enabled AND f.enabled AND f.storage = 'attributes' AND f.filterable = true
     ORDER BY f.sort_order`,
    [communityId]
  );
  return result.rows
    .map((row) => parseField(row as Record<string, unknown>))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));
}

export async function listPublicProfiles(communityId: string, searchParams: URLSearchParams = new URLSearchParams()) {
  const emptyMeta = { page: 1, pageSize: SHOWCASE_PAGE_SIZE, total: 0 };
  const on = await moduleRuntime.isEnabled(communityId, showcaseContribution.slug);
  if (!on) {
    return { status: 404 as const, data: [], facets: [], meta: emptyMeta };
  }
  const facets = await listPublicFacets(communityId);
  const built = peopleListQuery({
    communityId,
    searchParams,
    fields: facets,
    scope: 'showcase',
  });
  if (built.ok === false) {
    return { status: 400 as const, data: [], facets, meta: emptyMeta, message: built.message };
  }
  const counted = built.countText
    ? await query<{ total: number }>(built.countText, built.countParams)
    : { rows: [{ total: 0 }] };
  const result = await query(built.text, built.params);
  const attributeKeys = facets.map((field) => field.name);
  return {
    status: 200 as const,
    data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>, attributeKeys)),
    facets,
    meta: { page: built.page, pageSize: built.pageSize, total: counted.rows[0]?.total ?? 0 },
  };
}
