'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    brand: 'Alumni',
    back: 'Voltar para a vitrine',
    directory: 'Diretório',
    showcase: 'Vitrine',
    profile: 'Perfil',
    coord: 'Pedidos',
    signin: 'Entrar',
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
    coordBadge: 'Coordination',
  },
} as const;

export default function MemberHeader() {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, 'pt-BR');
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
          <Link
            href="/showcase"
            className="inline-flex items-center min-h-11 px-3 text-sm text-muted hover:text-text"
          >
            {copy.back}
          </Link>
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
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs rounded bg-canvas text-muted border border-border">
                {copy.coordBadge}
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6" aria-label="Navegação">
              <Link href="/coord/approvals" className="border-b-2 border-cta pb-4 text-sm font-medium">
                {copy.coord}
              </Link>
              <Link href="/directory" className="text-muted hover:text-text text-sm font-medium pb-4">
                {copy.directory}
              </Link>
            </nav>
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
            <Link href="/directory" className={pathname.startsWith('/directory') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted'}>
              {copy.directory}
            </Link>
            <Link href="/showcase" className={pathname.startsWith('/showcase') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted'}>
              {copy.showcase}
            </Link>
            <Link href="/profile/edit" className={pathname.startsWith('/profile') ? 'font-semibold border-b-2 border-cta pb-1' : 'text-muted'}>
              {copy.profile}
            </Link>
          </nav>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-11 px-4 text-sm border border-border rounded-lg hover:bg-canvas"
        >
          {copy.signin}
        </Link>
      </div>
    </header>
  );
}
