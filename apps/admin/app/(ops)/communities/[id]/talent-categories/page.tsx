import { CommunityTalentCategories } from '@/components/community-talent-categories';

export default async function CommunityTalentCategoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityTalentCategories communityId={id} />;
}
