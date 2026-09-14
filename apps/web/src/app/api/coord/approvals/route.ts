import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';
import { activeMembership } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await query<{ id: string; community_id: string; network_role: string }>(
    `SELECT id, community_id, network_role FROM network_core.memberships
     WHERE user_id = $1 AND network_role = 'coordinator' AND network_status = 'active'
     LIMIT 1`,
    [member.sub]
  );
  const coord = membership.rows[0];
  if (!coord) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  if (member.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const pending = await query(
    `SELECT m.id, p.full_name, m.network_status
     FROM network_core.memberships m
     JOIN person_core.profiles p ON p.user_id = m.user_id
     WHERE m.community_id = $1 AND m.network_status = 'pending_approval'`,
    [coord.community_id]
  );
  return NextResponse.json({ pending: pending.rows });
}

export async function POST(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  if (member.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const body = await req.json();
  const membershipId = body.membershipId;
  const action = body.action;
  const coord = await activeMembership(member.sub);
  if (!coord) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  const role = await query<{ network_role: string }>(
    `SELECT network_role FROM network_core.memberships WHERE id = $1`,
    [coord.id]
  );
  if (role.rows[0]?.network_role !== 'coordinator') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  const status = action === 'approve' ? 'active' : 'suspended';
  await query(
    `UPDATE network_core.memberships SET network_status = $1
     WHERE id = $2 AND community_id = $3`,
    [status, membershipId, coord.community_id]
  );
  return NextResponse.json({ status });
}
