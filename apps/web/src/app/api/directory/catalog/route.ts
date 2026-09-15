import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { nestCatalog } from '@community/directory';
import { activeMembership, moduleRuntime } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await activeMembership(member.sub);
  if (!membership) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Sem membership ativa' } }, { status: 403 });
  }
  const on = await moduleRuntime.isEnabled(membership.community_id, 'directory');
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const result = await queryAsMember(
    { userId: member.sub, communityId: membership.community_id },
    `SELECT g.slug AS group_slug, g.label AS group_label, g.description AS group_description,
            g.sort_order AS group_sort_order, g.columns,
            f.name, f.type, f.label, f.description, f.options, f.span, f.required,
            f.sort_order, f.storage, f.column_key, f.filterable
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     WHERE g.community_id = $1
     ORDER BY g.sort_order, f.sort_order NULLS LAST`,
    [membership.community_id]
  );
  return NextResponse.json({ groups: nestCatalog(result.rows as Record<string, unknown>[]) });
}
