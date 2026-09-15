import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

export async function GET(req: NextRequest) {
  const claims = await memberFromRequest(req);
  if (claims?.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  if (resolved.seat.network_role !== 'coordinator') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  const pending = await query(
    `SELECT m.id, p.full_name, m.network_status
     FROM network_core.memberships m
     JOIN person_core.profiles p ON p.user_id = m.user_id
     WHERE m.community_id = $1 AND m.network_status = 'pending_approval'`,
    [resolved.seat.id]
  );
  return NextResponse.json({ pending: pending.rows });
}

export async function POST(req: NextRequest) {
  const claims = await memberFromRequest(req);
  if (claims?.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  if (resolved.seat.network_role !== 'coordinator') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  const body = await req.json();
  const membershipId = body.membershipId;
  const action = body.action;
  const status = action === 'approve' ? 'active' : 'suspended';
  await query(
    `UPDATE network_core.memberships SET network_status = $1
     WHERE id = $2 AND community_id = $3`,
    [status, membershipId, resolved.seat.id]
  );
  return NextResponse.json({ status });
}
