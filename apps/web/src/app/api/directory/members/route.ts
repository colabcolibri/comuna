import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';
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
  const on = await moduleRuntime.isEnabled(membership.community_id, 'directory');
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const result = await query(
    `SELECT m.id, p.full_name, c.headline, c.bio, c.availability_status
     FROM network_core.memberships m
     JOIN person_core.profiles p ON p.user_id = m.user_id
     LEFT JOIN plugin_directory.cards c ON c.membership_id = m.id
     WHERE m.community_id = $1 AND m.network_status = 'active'`,
    [membership.community_id]
  );
  return NextResponse.json({ data: result.rows, meta: { page: 1 } });
}
