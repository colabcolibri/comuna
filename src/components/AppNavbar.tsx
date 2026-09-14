'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function AppNavbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useI18n();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/profile/edit', label: t.nav.profile },
    { href: '/directory', label: t.nav.directory },
    { href: '/showcase', label: t.nav.showcase },
    { href: '/admin/approvals', label: t.nav.admin },
  ];

  return (
    <nav style={{ background: '#0f172a', color: '#ffffff', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none' }}>
          {t.nav.brand}
        </Link>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Seletor de Idioma PT / EN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #334155' }}>
        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>🌐</span>
        <button
          onClick={() => setLang('pt')}
          style={{
            background: lang === 'pt' ? '#0284c7' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: lang === 'pt' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          PT
        </button>
        <button
          onClick={() => setLang('en')}
          style={{
            background: lang === 'en' ? '#0284c7' : 'transparent',
            color: '#ffffff',
            border: 'none',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: lang === 'en' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          EN
        </button>
      </div>
    </nav>
  );
}
