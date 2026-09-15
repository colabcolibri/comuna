import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { queryAsMember } from '@community/db';
import {
  MAX_AVATAR_BYTES,
  avatarObjectKey,
  avatarPublicPath,
  createObjectStore,
  detectImage,
} from '@community/files';
import { activeMembership } from '@/lib/server/membership';

export async function POST(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const key = avatarObjectKey(member.sub);
  const publicPath = avatarPublicPath(member.sub);
  if (!key || !publicPath) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Utilizador inválido' } }, { status: 400 });
  }
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Ficheiro obrigatório' } }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_AVATAR_BYTES) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Ficheiro demasiado grande' } }, { status: 400 });
  }
  const kind = detectImage(bytes);
  if (!kind) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Imagem inválida' } }, { status: 400 });
  }
  const store = createObjectStore();
  await store.put(key, bytes, kind.mime);
  const membership = await activeMembership(member.sub);
  const ctx = { userId: member.sub, communityId: membership?.community_id ?? null };
  const name = member.email.split('@')[0] || 'Member';
  await queryAsMember(
    ctx,
    `INSERT INTO person_core.profiles (user_id, full_name, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url, updated_at = now()`,
    [member.sub, name, publicPath]
  );
  return NextResponse.json({ avatar_url: publicPath });
}
