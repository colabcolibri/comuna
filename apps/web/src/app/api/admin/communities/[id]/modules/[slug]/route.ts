import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; slug: string }> }
) {
  const member = await memberFromRequest(req);
  if (!member || member.global_role !== 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Ops only' } }, { status: 403 });
  }
  const { id, slug } = await ctx.params;
  const body = await req.json();
  const enabled = Boolean(body.enabled);
  const mod = await query<{ id: string }>(`SELECT id FROM plugin_core.modules WHERE slug = $1`, [slug]);
  if (!mod.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desconhecido' } }, { status: 404 });
  }
  await query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = EXCLUDED.enabled`,
    [id, mod.rows[0].id, enabled]
  );
  return NextResponse.json({ enabled });
}
