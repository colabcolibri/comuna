import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { parseLocalized } from '@community/identity';
import { activeMembership, moduleRuntime } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await activeMembership(member.sub);
  if (!membership) {
    return NextResponse.json({ membership: null, card: null });
  }
  const on = await moduleRuntime.isEnabled(membership.community_id, 'directory');
  const card = on
    ? await queryAsMember(
        { userId: member.sub, communityId: membership.community_id },
        `SELECT headline, bio, availability_status, public_showcase, custom_attributes
         FROM plugin_directory.cards WHERE membership_id = $1`,
        [membership.id]
      )
    : { rows: [] };
  return NextResponse.json({
    membership: { id: membership.id, community_id: membership.community_id },
    card: card.rows[0] ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await activeMembership(member.sub);
  if (!membership) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Sem membership ativa' } }, { status: 403 });
  }
  const body = await req.json();
  const communityId = body.community_id;
  if (communityId && communityId !== membership.community_id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Membership de outra comunidade' } },
      { status: 403 }
    );
  }
  const headline = parseLocalized(body.headline);
  const bio = parseLocalized(body.bio);
  await queryAsMember(
    { userId: member.sub, communityId: membership.community_id },
    `INSERT INTO plugin_directory.cards (
       membership_id, headline, bio, availability_status, public_showcase, custom_attributes
     ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6::jsonb)
     ON CONFLICT (membership_id) DO UPDATE SET
       headline = EXCLUDED.headline,
       bio = EXCLUDED.bio,
       availability_status = EXCLUDED.availability_status,
       public_showcase = EXCLUDED.public_showcase,
       custom_attributes = EXCLUDED.custom_attributes`,
    [
      membership.id,
      JSON.stringify(headline),
      JSON.stringify(bio),
      body.availability_status ?? null,
      Boolean(body.public_showcase),
      JSON.stringify(body.custom_attributes || {}),
    ]
  );
  return NextResponse.json({ ok: true, membership_id: membership.id });
}
