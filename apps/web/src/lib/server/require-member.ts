import { redirect } from 'next/navigation';
import { getMemberSession } from '@/lib/server/member-session';
import { activeMembership } from '@/lib/server/membership';
import type { AppQueryCtx } from '@/lib/server/app-ctx';

export async function requireActiveMember(): Promise<
  { ok: true; ctx: AppQueryCtx } | { ok: false; status: 403 }
> {
  const session = await getMemberSession();
  if (!session) {
    redirect('/login');
  }
  const membership = await activeMembership(session.sub);
  if (!membership) {
    return { ok: false, status: 403 };
  }
  return { ok: true, ctx: { userId: session.sub, communityId: membership.community_id } };
}
