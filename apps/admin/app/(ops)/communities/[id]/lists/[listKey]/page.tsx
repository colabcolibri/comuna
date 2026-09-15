import { CommunityLists } from '@/components/community-lists';
import { notFound } from 'next/navigation';

export default async function CommunityListPage({
  params,
}: {
  params: Promise<{ id: string; listKey: string }>;
}) {
  const { id, listKey } = await params;
  if (listKey !== 'directory' && listKey !== 'showcase') {
    notFound();
  }
  return <CommunityLists communityId={id} listKey={listKey} />;
}
