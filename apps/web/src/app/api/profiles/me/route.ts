import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const result = await query(
    `SELECT p.full_name, p.avatar_url, p.preferred_locale
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
  const body = await req.json();
  const fullName = String(body.full_name || '').trim();
  if (!fullName) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'full_name obrigatório' } }, { status: 400 });
  }
  await query(
    `INSERT INTO person_core.profiles (user_id, full_name, avatar_url, preferred_locale)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       avatar_url = EXCLUDED.avatar_url,
       preferred_locale = EXCLUDED.preferred_locale,
       updated_at = now()`,
    [member.sub, fullName, body.avatar_url ?? null, body.preferred_locale || 'pt-BR']
  );
  const result = await query(
    `SELECT full_name, avatar_url, preferred_locale FROM person_core.profiles WHERE user_id = $1`,
    [member.sub]
  );
  return NextResponse.json({ profile: result.rows[0] });
}
