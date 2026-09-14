'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    brand: 'Community',
    home: 'Entrar',
    profile: 'Perfil',
    directory: 'Diretório',
    showcase: 'Vitrine',
    coord: 'Pedidos',
  },
  en: {
    brand: 'Community',
    home: 'Sign in',
    profile: 'Profile',
    directory: 'Directory',
    showcase: 'Showcase',
    coord: 'Requests',
  },
} as const;

export default function AppNavbar() {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  if (pathname.startsWith('/ops') || pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: copy.home },
    { href: '/profile/edit', label: copy.profile },
    { href: '/directory', label: copy.directory },
    { href: '/showcase', label: copy.showcase },
  ];

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3"
      style={{ background: 'var(--cta)', color: '#ffffff' }}
    >
      <Link href="/" className="font-semibold text-lg" style={{ color: '#ffffff', textDecoration: 'none' }}>
        {copy.brand}
      </Link>
      <div className="flex flex-wrap gap-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? '#38bdf8' : '#cbd5e1',
              textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
