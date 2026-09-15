import { CommunityFields } from '@/components/community-fields';

export default async function CommunityFieldsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityFields communityId={id} />;
}
