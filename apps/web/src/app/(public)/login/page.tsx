import { redirect } from 'next/navigation';
import { AppAuthFrame } from '@community/ui-member';
import { DemoMemberLogin } from '@/components/app/DemoMemberLogin';
import OtpCard from '@/components/app/OtpCard';
import { isDatabaseReadOnly } from '@/lib/read-only';
import { getMemberSession } from '@/lib/server/member-session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getMemberSession();
  const next = (await searchParams).next;
  if (session) {
    const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
    redirect(target);
  }

  return (
    <AppAuthFrame>
      {isDatabaseReadOnly() ? <DemoMemberLogin /> : <OtpCard />}
    </AppAuthFrame>
  );
}
