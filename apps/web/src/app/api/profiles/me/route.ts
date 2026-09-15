import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { PERSON_PROFILE_COLUMNS, personWriteFromBody, personWriteSqlParams } from '@community/identity';
import { activeMembership } from '@/lib/server/membership';

async function memberCtx(userId: string) {
  const membership = await activeMembership(userId);
  return { userId, communityId: membership?.community_id ?? null };
}

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const result = await queryAsMember(
    await memberCtx(member.sub),
    `SELECT ${PERSON_PROFILE_COLUMNS}
     FROM person_core.profiles p
     WHERE p.user_id = $1`,
    [member.sub]
  );
  return NextResponse.json({ profile: result.rows[0] ?? null });
}

export async function PUT(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const parsed = personWriteFromBody(await req.json());
  if (!parsed.ok) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }
  const ctx = await memberCtx(member.sub);
  await queryAsMember(
    ctx,
    `INSERT INTO person_core.profiles (
       user_id, full_name, avatar_url, preferred_locale, gender, birth_country, current_country,
       birth_city, current_city, languages, contacts
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       avatar_url = EXCLUDED.avatar_url,
       preferred_locale = EXCLUDED.preferred_locale,
       gender = EXCLUDED.gender,
       birth_country = EXCLUDED.birth_country,
       current_country = EXCLUDED.current_country,
       birth_city = EXCLUDED.birth_city,
       current_city = EXCLUDED.current_city,
       languages = EXCLUDED.languages,
       contacts = EXCLUDED.contacts,
       updated_at = now()`,
    personWriteSqlParams(member.sub, parsed.write)
  );
  const result = await queryAsMember(
    ctx,
    `SELECT ${PERSON_PROFILE_COLUMNS} FROM person_core.profiles WHERE user_id = $1`,
    [member.sub]
  );
  return NextResponse.json({ profile: result.rows[0] });
}
