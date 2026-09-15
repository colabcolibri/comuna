import { queryAsMember } from '@community/db';
import { directoryContribution, parseAttrFilters, parseField } from '@community/directory';
import type { AppQueryCtx } from '@/lib/server/app-ctx';
import { toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';

export async function listDirectoryMembers(ctx: AppQueryCtx, searchParams: URLSearchParams) {
  const on = await moduleRuntime.isEnabled(ctx.communityId, directoryContribution.slug);
  if (!on) {
    return { status: 404 as const, body: { error: { code: 'NOT_FOUND', message: 'Módulo desligado' } } };
  }
  const catalog = await queryAsMember(
    ctx,
    'SELECT f.name, f.type, f.options, f.storage, f.column_key, f.filterable, f.required, f.span, f.sort_order, f.label FROM plugin_directory.fields f JOIN plugin_directory.field_groups g ON g.id = f.group_id WHERE g.community_id = $1',
    [ctx.communityId]
  );
  const fields = catalog.rows
    .map((row) => parseField(row as Record<string, unknown>))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));
  const parsed = parseAttrFilters(searchParams, fields);
  if (parsed.ok === false) {
    return { status: 400 as const, body: { error: { code: 'VALIDATION_ERROR', message: parsed.message } } };
  }
  const clauses = ['m.community_id = $1', "m.network_status = 'active'"];
  const params: unknown[] = [ctx.communityId];
  parsed.filters.forEach((filter) => {
    params.push(JSON.stringify(filter));
    clauses.push(`c.custom_attributes @> $${params.length}::jsonb`);
  });
  const search = searchParams.get('search')?.trim() || '';
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`(p.full_name ILIKE $${params.length} OR c.headline::text ILIKE $${params.length})`);
  }
  const sql =
    'SELECT m.id, p.full_name, p.avatar_url, p.current_city, p.languages, p.contacts, c.headline, c.bio, c.availability_status, c.custom_attributes ' +
    'FROM network_core.memberships m ' +
    'JOIN person_core.profiles p ON p.user_id = m.user_id ' +
    'JOIN plugin_directory.cards c ON c.membership_id = m.id ' +
    'WHERE ' +
    clauses.join(' AND ') +
    ' ORDER BY p.full_name';
  const result = await queryAsMember(ctx, sql, params);
  return {
    status: 200 as const,
    body: {
      data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>)),
      meta: { page: 1 },
    },
  };
}
