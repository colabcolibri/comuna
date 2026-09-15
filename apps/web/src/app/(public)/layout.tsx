import type { ReactNode } from 'react';
import { listPublicCommunities } from '@community/communities';
import { listMyCommunities } from '@community/memberships';
import { PublicShell } from '@/components/app/PublicShell';
import { getMemberSession } from '@/lib/server/member-session';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await getMemberSession();
  const seats = session ? await listMyCommunities(session.sub) : [];
  const publics = await listPublicCommunities();
  return (
    <PublicShell signedIn={Boolean(session)} seats={seats} publics={publics}>
      {children}
    </PublicShell>
  );
}
