import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { decideJoinRequest, JoinNotAllowedError, listPendingJoins } from '@community/memberships';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

async function coordinatorFromRequest(req: NextRequest) {
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
  return resolved;
}

export async function GET(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) {
    return resolved;
  }
  const pending = await listPendingJoins({ userId: resolved.userId, communityId: resolved.seat.id });
  return NextResponse.json({ pending });
}

export async function POST(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) {
    return resolved;
  }
  const body = await req.json();
  const action = body.action === 'approve' || body.action === 'reject' ? body.action : null;
  if (!action || typeof body.membershipId !== 'string') {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Pedido inválido' } }, { status: 400 });
  }
  try {
    const result = await decideJoinRequest(
      { userId: resolved.userId, communityId: resolved.seat.id },
      body.membershipId,
      action
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof JoinNotAllowedError) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não foi possível deliberar' } }, { status: 403 });
    }
    throw err;
  }
}
