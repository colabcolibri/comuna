import { CommunityModules } from '@/components/community-modules';

export default async function CommunityModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityModules communityId={id} />;
}
