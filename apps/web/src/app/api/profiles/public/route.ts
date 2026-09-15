import { NextResponse } from 'next/server';
import { listPublicProfiles } from '@/lib/server/public-profiles';

export async function GET() {
  const listed = await listPublicProfiles();
  if (listed.status === 404) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  return NextResponse.json({ data: listed.data, meta: { page: 1 } });
}
