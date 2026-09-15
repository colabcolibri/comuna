import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { COMMUNITY_COOKIE } from '@community/communities';
import { listMyCommunities, pickCommunitySeat } from '@community/memberships';
import { viewerEnabledSlugs, moduleRuntime } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    const enabled = await viewerEnabledSlugs(null);
    return NextResponse.json({ enabled });
  }
  const seats = await listMyCommunities(member.sub);
  const picked = pickCommunitySeat(seats, req.cookies.get(COMMUNITY_COOKIE)?.value);
  if (!picked.ok) {
    if (picked.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Escolha uma comunidade' } },
        { status: 400 }
      );
    }
    const enabled = await viewerEnabledSlugs(null);
    return NextResponse.json({ enabled });
  }
  return NextResponse.json({ enabled: await moduleRuntime.listEnabled(picked.seat.id) });
}
