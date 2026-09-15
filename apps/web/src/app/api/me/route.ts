import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { COMMUNITY_COOKIE } from '@community/communities';
import { listMyCommunities, pickCommunitySeat } from '@community/memberships';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ user: null });
  }
  const seats = await listMyCommunities(member.sub);
  const picked = pickCommunitySeat(seats, req.cookies.get(COMMUNITY_COOKIE)?.value);
  return NextResponse.json({
    user: {
      email: member.email,
      global_role: member.global_role,
      network_role: picked.ok ? picked.seat.network_role : null,
    },
  });
}
