import { CommunityMembers } from '@/components/community-members';

export default async function CommunityMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityMembers communityId={id} />;
}
