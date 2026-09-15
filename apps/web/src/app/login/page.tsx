import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, resolveUiLocale } from '@community/identity';
import { AppAuthFrame } from '@community/ui-member';
import OtpCard from '@/components/app/OtpCard';
import { getMemberSession } from '@/lib/server/member-session';
import { uiCatalog } from '@/lang/catalog';

export default async function LoginPage() {
  const session = await getMemberSession();
  if (session) {
    redirect('/directory');
  }
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = uiCatalog.bind('core_web', locale);

  return (
    <AppAuthFrame kicker={t('login.kicker')}>
      <OtpCard />
      <p className="mt-6 text-center text-base text-muted-foreground">{t('login.hint')}</p>
    </AppAuthFrame>
  );
}
