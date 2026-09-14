import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const member = await memberFromRequest(req);
  if (!member || member.global_role !== 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Ops only' } }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const userId = body.user_id;
  if (!userId) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'user_id obrigatório' } }, { status: 400 });
  }
  const updated = await query(
    `UPDATE network_core.memberships
     SET network_role = 'coordinator'
     WHERE community_id = $1 AND user_id = $2
     RETURNING id, network_role`,
    [id, userId]
  );
  if (!updated.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Membership inexistente' } }, { status: 404 });
  }
  return NextResponse.json(updated.rows[0]);
}
