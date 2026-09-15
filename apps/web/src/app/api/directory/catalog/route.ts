import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { nestCatalog, visibleCatalog } from '@community/directory';
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
  const result = await queryAsMember(
    { userId: member.sub, communityId: membership.community_id },
    `SELECT g.slug AS group_slug, g.label AS group_label, g.description AS group_description,
            g.sort_order AS group_sort_order, g.columns,
            f.name, f.type, f.label, f.description, f.options, f.span, f.required,
            f.sort_order, f.storage, f.column_key, f.filterable, m.slug AS module_slug
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     LEFT JOIN plugin_core.modules m ON m.id = f.module_id
     WHERE g.community_id = $1
     ORDER BY g.sort_order, f.sort_order NULLS LAST`,
    [membership.community_id]
  );
  const enabled = await moduleRuntime.listEnabled(membership.community_id);
  return NextResponse.json({ groups: visibleCatalog(nestCatalog(result.rows as Record<string, unknown>[]), enabled) });
}
