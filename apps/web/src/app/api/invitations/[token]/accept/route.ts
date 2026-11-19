import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, memberAuthCookieOptions, signMemberToken } from '@community/auth';
import { COMMUNITY_COOKIE } from '@community/communities';
import { query } from '@community/db';

type InviteRow = {
  id: string;
  community_id: string;
  community_slug: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
};

export async function POST(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Convite inválido.' } }, { status: 404 });
  }

  const found = await query<InviteRow>(
    `SELECT i.id, i.community_id, c.slug AS community_slug, i.email, i.expires_at, i.accepted_at
     FROM network_core.invitations i
     JOIN network_core.communities c ON c.id = i.community_id
     WHERE i.token = $1`,
    [token]
  );
  const invite = found.rows[0];
  if (!invite) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Convite não encontrado.' } }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: { code: 'ALREADY_USED', message: 'Este convite já foi utilizado.' } }, { status: 410 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: { code: 'EXPIRED', message: 'Este convite expirou.' } }, { status: 410 });
  }

  const email = invite.email.trim().toLowerCase();
  const existingUser = await query<{ id: string; email: string; global_role: string }>(
    `SELECT id, email, global_role FROM auth_core.users WHERE lower(email) = $1 LIMIT 1`,
    [email]
  );

  let user = existingUser.rows[0];
  if (!user) {
    const created = await query<{ id: string; email: string; global_role: string }>(
      `INSERT INTO auth_core.users (email, global_role)
       VALUES ($1, 'member')
       RETURNING id, email, global_role`,
      [email]
    );
    user = created.rows[0];
  }

  await query(
    `INSERT INTO person_core.profiles (user_id, full_name)
     VALUES ($1, '')
     ON CONFLICT (user_id) DO NOTHING`,
    [user.id]
  );

  await query(
    `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
     VALUES ($1, $2, 'member', 'active')
     ON CONFLICT (community_id, user_id) DO UPDATE SET network_status = 'active'`,
    [invite.community_id, user.id]
  );

  await query(`UPDATE network_core.invitations SET accepted_at = now() WHERE id = $1`, [invite.id]);

  const jwt = await signMemberToken({
    sub: user.id,
    email: user.email,
    global_role: (user.global_role as 'member' | 'super_admin') || 'member',
  });

  const response = NextResponse.json({
    ok: true,
    redirectTo: `/c/${invite.community_slug}/profile`,
  });
  response.cookies.set(AUTH_COOKIE, jwt, memberAuthCookieOptions());
  response.cookies.set(COMMUNITY_COOKIE, invite.community_slug, { path: '/', sameSite: 'lax' });
  return response;
}
