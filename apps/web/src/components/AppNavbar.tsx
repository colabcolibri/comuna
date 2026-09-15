'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { uiCatalog } from '@/lang/catalog';
import { copyFrom, visibleChrome } from '@/modules/registry';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  brand: 'navbar.brand',
  home: 'navbar.home',
  profile: 'chrome.profile',
  directory: 'chrome.directory',
  showcase: 'chrome.showcase',
  coord: 'chrome.coord',
});

export default function AppNavbar() {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const enabled = useEnabledModules();
  if (pathname.startsWith('/ops') || pathname.startsWith('/admin')) {
    return null;
  }

  const pluginLinks = [
    ...visibleChrome(enabled, 'header', false),
    ...visibleChrome(enabled, 'sidebar', false),
  ].filter((item, index, all) => all.findIndex((other) => other.href === item.href) === index);

  const navLinks = [
    { href: '/', label: copy.home },
    { href: '/profile/edit', label: copy.profile },
    ...pluginLinks.map((item) => ({ href: item.href, label: copyFrom(copy, item.copyKey) })),
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
