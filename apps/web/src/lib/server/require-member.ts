import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { COMMUNITY_COOKIE, getCommunityBySlug } from '@community/communities';
import { listMyCommunities, pickCommunitySeat, type MyCommunity } from '@community/memberships';
import { getMemberSession } from '@/lib/server/member-session';
import type { AppQueryCtx } from '@/lib/server/app-ctx';
import { communityPath } from '@/lib/people/community-path';

export async function requireMemberForSlug(
  slug: string
): Promise<{ ok: true; ctx: AppQueryCtx; seat: MyCommunity } | { ok: false; status: 403 }> {
  const session = await getMemberSession();
  if (!session) {
    redirect('/login');
  }
  const community = await getCommunityBySlug(slug);
  if (!community) {
    notFound();
  }
  const seats = await listMyCommunities(session.sub);
  const picked = pickCommunitySeat(seats, community.slug);
  if (!picked.ok) {
    return { ok: false, status: 403 };
  }
  return {
    ok: true,
    ctx: { userId: session.sub, communityId: picked.seat.id },
    seat: picked.seat,
  };
}

export async function resolveLegacyMemberPath(job: string) {
  const session = await getMemberSession();
  if (!session) {
    redirect('/login');
  }
  const seats = await listMyCommunities(session.sub);
  const cookieSlug = (await cookies()).get(COMMUNITY_COOKIE)?.value;
  const fromCookie = cookieSlug ? pickCommunitySeat(seats, cookieSlug) : null;
  if (fromCookie?.ok) {
    redirect(communityPath(fromCookie.seat.slug, job));
  }
  if (seats.length >= 1) {
    redirect(communityPath(seats[0].slug, job));
  }
  redirect('/login');
}
