import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { isSmtpConfigured } from '@community/auth/smtp';
import { queryAsMember } from '@community/db';
import { sendKindEmail } from '@community/mail';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

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

  const res = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT id, email, token, expires_at, accepted_at, created_at
     FROM network_core.invitations
     WHERE community_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [resolved.seat.id]
  );
  return NextResponse.json({ invitations: res.rows });
}

export async function POST(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) return resolved;

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'JSON inválido' } }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'E-mail inválido.' } }, { status: 400 });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const inserted = await queryAsMember<{
    id: string;
    email: string;
    token: string;
    expires_at: string;
    accepted_at: string | null;
    created_at: string;
  }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO network_core.invitations (community_id, email, token, invited_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, token, expires_at, accepted_at, created_at`,
    [resolved.seat.id, email, token, resolved.userId]
  );

  const invitation = inserted.rows[0];
  const origin = req.nextUrl.origin;
  const inviteUrl = `${origin}/invite/${token}`;

  let emailSent = false;
  if (isSmtpConfigured()) {
    try {
      const communityName = resolved.seat.name || 'Comunidade';
      await sendKindEmail({
        kind: 'person_invite',
        to: email,
        locale: 'pt-BR',
        vars: {
          community: communityName,
          login_url: inviteUrl,
        },
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }

  return NextResponse.json({ invitation, inviteUrl, emailSent }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const resolved = await coordinatorFromRequest(req);
  if (resolved instanceof NextResponse) return resolved;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'ID obrigatório' } }, { status: 400 });
  }

  await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `DELETE FROM network_core.invitations WHERE id = $1 AND community_id = $2`,
    [id, resolved.seat.id]
  );
  return NextResponse.json({ ok: true });
}
