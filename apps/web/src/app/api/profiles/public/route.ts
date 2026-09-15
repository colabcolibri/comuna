import { NextRequest, NextResponse } from 'next/server';
import { COMMUNITY_COOKIE, getCommunityBySlug } from '@community/communities';
import { listPublicProfiles } from '@/lib/server/public-profiles';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || req.cookies.get(COMMUNITY_COOKIE)?.value || '';
  const community = slug ? await getCommunityBySlug(slug) : null;
  if (!community) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Escolha uma comunidade' } }, { status: 400 });
  }
  const listed = await listPublicProfiles(community.id, req.nextUrl.searchParams);
  if (listed.status === 404) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  if (listed.status === 400) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: listed.message } }, { status: 400 });
  }
  return NextResponse.json({ data: listed.data, meta: listed.meta });
}
