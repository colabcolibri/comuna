import { redirect } from 'next/navigation';

export default async function CommunityListsIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/communities/${id}/lists/directory`);
}
