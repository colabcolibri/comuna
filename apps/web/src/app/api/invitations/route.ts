import { NextRequest, NextResponse } from 'next/server';
import { invitationsContribution, parseInviteInput } from '@community/invitations';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';
import {
  createCommunityInvitation,
  listCommunityInvitations,
  revokeCommunityInvitation,
} from '@/lib/server/invitations-service';

async function gate(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (resolved.ok === false) {
    return { ok: false as const, response: resolved.response };
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, invitationsContribution.slug);
  if (!on) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 }),
    };
  }
  return { ok: true as const, resolved };
}

export async function GET(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;

  const result = await listCommunityInvitations(
    { userId: resolved.userId, communityId: resolved.seat.id },
    { scope: 'mine' }
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;

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
      isCoordinator: resolved.seat.network_role === 'coordinator',
    }
  );
  if (created.ok === false) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: created.message } }, { status: created.status });
  }
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'ID obrigatório' } }, { status: 400 });
  }

  await revokeCommunityInvitation(
    { userId: resolved.userId, communityId: resolved.seat.id },
    { id, scope: 'mine' }
  );
  return NextResponse.json({ ok: true });
}
