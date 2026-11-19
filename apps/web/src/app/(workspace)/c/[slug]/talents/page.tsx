import { redirect } from 'next/navigation';

export default async function TalentsRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/c/${slug}/profile`);
}
