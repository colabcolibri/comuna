import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { displayCommunityName, getCommunity } from '@community/communities';
import { LOCALE_COOKIE, resolveUiLocale } from '@community/identity';
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
    <CommunityWorkspace
      name={displayCommunityName(
        community.name,
        community.settings.name_en,
        resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value)
      )}
      slug={community.slug}
    >
      {children}
    </CommunityWorkspace>
  );
}
