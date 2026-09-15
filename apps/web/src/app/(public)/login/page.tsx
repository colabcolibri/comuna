import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { AppAuthFrame } from '@community/ui-member';
import { DemoMemberLogin } from '@/components/app/DemoMemberLogin';
import OtpCard from '@/components/app/OtpCard';
import { isDatabaseReadOnly } from '@/lib/read-only';
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
    const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
    redirect(target);
  }
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);

  return (
    <AppAuthFrame kicker={copy.kicker || undefined}>
      {isDatabaseReadOnly() ? <DemoMemberLogin /> : <OtpCard />}
      {!isDatabaseReadOnly() && copy.hint ? (
        <p className="mt-6 text-center text-base text-muted-foreground">{copy.hint}</p>
      ) : null}
    </AppAuthFrame>
  );
}
