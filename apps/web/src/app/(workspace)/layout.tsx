import type { ReactNode } from 'react';
import { listMyCommunities } from '@community/memberships';
import { MemberShell } from '@/components/app/MemberShell';
import { getMemberSession } from '@/lib/server/member-session';

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await getMemberSession();
  const seats = session ? await listMyCommunities(session.sub) : [];
  return (
    <MemberShell sessionEmail={session?.email ?? null} seats={seats}>
      {children}
    </MemberShell>
  );
}
