import { redirect } from 'next/navigation';

export default async function CommunityIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/communities/${id}/settings`);
}
