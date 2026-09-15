import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import { PERSON_PROFILE_COLUMNS, personWriteFromBody, personWriteSqlParams } from '@community/identity/write';
import { COMMUNITY_COOKIE } from '@community/communities';
import { missingRequiredFields, parseField } from '@community/directory';
import { listMyCommunities, pickCommunitySeat } from '@community/memberships';

async function memberCtx(req: NextRequest, userId: string) {
  const seats = await listMyCommunities(userId);
  const picked = pickCommunitySeat(seats, req.cookies.get(COMMUNITY_COOKIE)?.value);
  return { userId, communityId: picked.ok ? picked.seat.id : seats[0]?.id ?? null };
}

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const result = await queryAsMember(
    await memberCtx(req, member.sub),
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
  if (parsed.ok === false) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }
  const ctx = await memberCtx(req, member.sub);
  if (ctx.communityId) {
    const catalog = await queryAsMember(
      ctx,
      `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.filterable, f.required, f.span, f.sort_order, f.label
       FROM plugin_directory.fields f
       JOIN plugin_directory.field_groups g ON g.id = f.group_id
       WHERE g.community_id = $1 AND g.enabled AND f.enabled`,
      [ctx.communityId]
    );
    const fields = catalog.rows
      .map((row) => parseField(row as Record<string, unknown>))
      .filter((field): field is NonNullable<typeof field> => Boolean(field) && field.storage === 'person');
    const values: Record<string, unknown> = {
      full_name: parsed.write.full_name,
      avatar_url: parsed.write.avatar_url,
      gender: parsed.write.gender,
      birth_city: parsed.write.birth_city,
      current_city: parsed.write.current_city,
      languages: parsed.write.languages,
      linkedin: parsed.write.contacts.linkedin,
      github: parsed.write.contacts.github,
      portfolio: parsed.write.contacts.portfolio,
    };
    if (missingRequiredFields(fields, values).length) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Preencha os campos obrigatórios.' } }, { status: 400 });
    }
  }
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
