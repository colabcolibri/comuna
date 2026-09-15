import { NextRequest, NextResponse } from 'next/server';
import { avatarObjectKey, createObjectStore } from '@community/files';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  const { userId } = await ctx.params;
  const key = avatarObjectKey(userId);
  if (!key) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Foto não encontrada' } }, { status: 404 });
  }
  const stored = await createObjectStore().get(key);
  if (!stored) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Foto não encontrada' } }, { status: 404 });
  }
  return new NextResponse(Buffer.from(stored.bytes), {
    headers: {
      'Content-Type': stored.mime,
      'Cache-Control': 'public, max-age=60',
    },
  });
}
