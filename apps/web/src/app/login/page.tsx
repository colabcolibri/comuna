import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { AppAuthFrame } from '@community/ui-member';
import OtpCard from '@/components/app/OtpCard';
import { getMemberSession } from '@/lib/server/member-session';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  kicker: 'login.kicker',
  hint: 'login.hint',
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getMemberSession();
  const next = (await searchParams).next;
  if (session) {
    redirect(next && next.startsWith('/c/') ? next : '/');
  }
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);

  return (
    <AppAuthFrame kicker={copy.kicker}>
      <OtpCard />
      <p className="mt-6 text-center text-base text-muted-foreground">{copy.hint}</p>
    </AppAuthFrame>
  );
}
