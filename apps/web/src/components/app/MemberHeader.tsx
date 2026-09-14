'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@community/ui';
import { pickContent } from '@community/identity';
import { LocaleSwitcher } from '@/components/app/LocaleSwitcher';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    brand: 'Alumni',
    back: 'Voltar para a vitrine',
    directory: 'Diretório',
    showcase: 'Vitrine',
    profile: 'Perfil',
    coord: 'Pedidos',
    signin: 'Entrar',
    signout: 'Sair',
    coordBadge: 'Coordenação',
  },
  en: {
    brand: 'Alumni',
    back: 'Back to showcase',
    directory: 'Directory',
    showcase: 'Showcase',
    profile: 'Profile',
    coord: 'Requests',
    signin: 'Sign in',
    signout: 'Sign out',
    coordBadge: 'Coordination',
  },
} as const;

function SessionChrome({
  email,
  signin,
  signout,
}: {
  email: string | null;
  signin: string;
  signout: string;
}) {
  async function onSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  if (email) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate max-w-[10rem] sm:max-w-xs text-sm text-muted-foreground" title={email}>
          {email}
        </span>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="inline-flex items-center justify-center min-h-11 px-4 text-sm border border-border rounded-lg hover:bg-background"
        >
          {signout}
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/"
      className="inline-flex items-center justify-center min-h-11 px-4 text-sm border border-border rounded-lg hover:bg-background"
    >
      {signin}
    </Link>
  );
}

export default function MemberHeader({ sessionEmail }: { sessionEmail: string | null }) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  if (pathname.startsWith('/ops')) {
    return null;
  }

  if (pathname === '/') {
    return (
      <header className="w-full border-b border-outline-variant/50 bg-surface">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 rounded-lg p-1 font-semibold tracking-tight">
            {copy.brand}
            <span className="w-1.5 h-1.5 rounded-full bg-cta mb-0.5" aria-hidden />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <ThemeToggle />
            <LocaleSwitcher />
            <SessionChrome email={sessionEmail} signin={copy.signin} signout={copy.signout} />
            <Link
              href="/showcase"
              className="inline-flex items-center min-h-11 px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              {copy.back}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  if (pathname.startsWith('/coord')) {
    return (
      <header className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-8 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight">{copy.brand}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs rounded bg-background text-muted-foreground border border-border">
                {copy.coordBadge}
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6" aria-label="Navegação">
              <Link href="/coord/approvals" className="border-b-2 border-cta pb-4 text-sm font-medium">
                {copy.coord}
              </Link>
              <Link href="/directory" className="text-muted-foreground hover:text-foreground text-sm font-medium pb-4">
                {copy.directory}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <ThemeToggle />
            <LocaleSwitcher />
            <SessionChrome email={sessionEmail} signin={copy.signin} signout={copy.signout} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="w-full max-w-[1120px] mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-6 sm:gap-10 min-w-0">
          <Link href="/" className="font-semibold tracking-tight shrink-0">
            {copy.brand}
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação">
            <Link href="/directory" className={pathname.startsWith('/directory') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted-foreground'}>
              {copy.directory}
            </Link>
            <Link href="/showcase" className={pathname.startsWith('/showcase') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted-foreground'}>
              {copy.showcase}
            </Link>
            <Link href="/profile/edit" className={pathname.startsWith('/profile') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted-foreground'}>
              {copy.profile}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <ThemeToggle />
          <LocaleSwitcher />
          <SessionChrome email={sessionEmail} signin={copy.signin} signout={copy.signout} />
        </div>
      </div>
    </header>
  );
}
