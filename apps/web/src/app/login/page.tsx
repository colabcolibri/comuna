import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, pickContent, resolveUiLocale } from '@community/identity';
import { AppAuthFrame } from '@community/ui-member';
import OtpCard from '@/components/app/OtpCard';
import { getMemberSession } from '@/lib/server/member-session';

const CONTENT = {
  'pt-BR': {
    kicker: 'Acesso',
    hint: 'O código chega no Mailpit em localhost:8026.',
  },
  en: {
    kicker: 'Access',
    hint: 'The code lands in Mailpit at localhost:8026.',
  },
} as const;

export default async function LoginPage() {
  const session = await getMemberSession();
  if (session) {
    redirect('/directory');
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
