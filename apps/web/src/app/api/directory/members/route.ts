import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { directoryContribution, parseAttrFilters, parseField } from '@community/directory';
import { activeMembership, moduleRuntime } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await activeMembership(member.sub);
  if (!membership) {
    return NextResponse.json({ data: [], meta: { page: 1 } });
  }
  const on = await moduleRuntime.isEnabled(membership.community_id, directoryContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const catalog = await queryAsMember(
    { userId: member.sub, communityId: membership.community_id },
    `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.filterable, f.required, f.span, f.sort_order, f.label
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1`,
    [membership.community_id]
  );
  const fields = catalog.rows
    .map((row) => parseField(row as Record<string, unknown>))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));
  const parsed = parseAttrFilters(req.nextUrl.searchParams, fields);
  if (!parsed.ok) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }
  const clauses = ['m.community_id = $1', `m.network_status = 'active'`];
  const params: unknown[] = [membership.community_id];
  parsed.filters.forEach((filter) => {
    params.push(JSON.stringify(filter));
    clauses.push(`c.custom_attributes @> $${params.length}::jsonb`);
  });
  const search = req.nextUrl.searchParams.get('search')?.trim() || '';
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`p.full_name ILIKE $${params.length}`);
  }
  const result = await queryAsMember(
    { userId: member.sub, communityId: membership.community_id },
    `SELECT m.id, p.full_name, p.current_city, p.languages, c.headline, c.bio, c.availability_status, c.custom_attributes
     FROM network_core.memberships m
     JOIN person_core.profiles p ON p.user_id = m.user_id
     LEFT JOIN plugin_directory.cards c ON c.membership_id = m.id
     WHERE ${clauses.join(' AND ')}`,
    params
  );
  return NextResponse.json({ data: result.rows, meta: { page: 1 } });
}
