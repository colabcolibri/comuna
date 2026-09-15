import { redirect } from 'next/navigation';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { listPublicProfiles } from '@/lib/server/public-profiles';

export default async function ShowcasePage() {
  const listed = await listPublicProfiles();
  if (listed.status === 404) {
    redirect('/');
  }
  return <ShowcasePanel rows={listed.data} />;
}
