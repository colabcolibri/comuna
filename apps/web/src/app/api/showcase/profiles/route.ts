import { listPublicProfiles } from '@/lib/server/public-profiles';
import { COMMUNITY_COOKIE, getCommunityBySlug } from '@community/communities';
import { NextRequest, NextResponse } from 'next/server';

async function communityFromRequest(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || req.cookies.get(COMMUNITY_COOKIE)?.value || '';
  if (!slug) {
    return null;
  }
  return getCommunityBySlug(slug);
}

export async function GET(req: NextRequest) {
  const community = await communityFromRequest(req);
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
  return NextResponse.json({ data: listed.data, countries: listed.countries, meta: listed.meta });
}
