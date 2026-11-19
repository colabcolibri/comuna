import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { parseInviteInput } from '@community/invitations';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import {
  createCommunityInvitation,
  listCommunityInvitations,
  revokeCommunityInvitation,
} from '@/lib/server/invitations-service';

async function coordinatorFromRequest(req: NextRequest) {
  const claims = await memberFromRequest(req);
  if (claims?.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const resolved = await memberCommunityFromRequest(req);
  if (resolved.ok === false) {
    return resolved.response;
  }
  if (resolved.seat.network_role !== 'coordinator') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Não é coordenador' } }, { status: 403 });
  }
  return resolved;
}

export async function GET(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) return resolved;

  const result = await listCommunityInvitations(
    { userId: resolved.userId, communityId: resolved.seat.id },
    { scope: 'all' }
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) return resolved;

  let body: { email?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'JSON inválido' } }, { status: 400 });
  }

  const parsed = parseInviteInput(body);
  if (parsed.ok === false) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }

  const created = await createCommunityInvitation(
    { userId: resolved.userId, communityId: resolved.seat.id },
    {
      communityName: resolved.seat.name,
      email: parsed.email,
      locale: parsed.locale,
      origin: req.nextUrl.origin,
      isCoordinator: true,
    }
  );
  if (created.ok === false) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: created.message } }, { status: created.status });
  }
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) return resolved;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'ID obrigatório' } }, { status: 400 });
  }

  await revokeCommunityInvitation(
    { userId: resolved.userId, communityId: resolved.seat.id },
    { id, scope: 'all' }
  );
  return NextResponse.json({ ok: true });
}
