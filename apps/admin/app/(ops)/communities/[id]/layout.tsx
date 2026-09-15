import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getCommunity } from '@community/communities';
import { CommunityWorkspace } from '@/components/community-workspace';

export const dynamic = 'force-dynamic';

export default async function CommunityLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = await getCommunity(id);
  if (!community) {
    notFound();
  }
  return (
    <CommunityWorkspace name={community.name} slug={community.slug}>
      {children}
    </CommunityWorkspace>
  );
}
