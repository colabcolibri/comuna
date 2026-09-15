import { CommunityCohorts } from '@/components/community-cohorts';

export default async function CommunityCohortsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityCohorts communityId={id} />;
}
