import Link from 'next/link';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, pickContent, resolveUiLocale } from '@community/identity';
import { AppPageTemplate } from '@community/ui-member';
import { getMemberSession } from '@/lib/server/member-session';

const CONTENT = {
  'pt-BR': {
    kicker: 'Início',
    title: 'Rede de comunidades',
    subtitle: 'Diretório profissional intermediado. Contato sem e-mail público.',
    signin: 'Entrar',
    directory: 'Ir ao diretório',
    showcase: 'Ver a vitrine',
  },
  en: {
    kicker: 'Home',
    title: 'Community network',
    subtitle: 'Mediated professional directory. No public email.',
    signin: 'Sign in',
    directory: 'Go to directory',
    showcase: 'View showcase',
  },
} as const;

export default async function HomePage() {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {session ? (
          <Link
            href="/directory"
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            {copy.directory}
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            {copy.signin}
          </Link>
        )}
        <Link
          href="/showcase"
          className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg border border-border text-sm"
        >
          {copy.showcase}
        </Link>
      </div>
    </AppPageTemplate>
  );
}
