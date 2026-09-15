import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../apps/web/src/components/app/AppSidebar';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';
import { SidebarProvider } from '@community/ui';

vi.mock('next/navigation', () => ({
  usePathname: () => '/c/lab/directory',
}));

const alumni = {
  id: 'c1',
  slug: 'alumni',
  name: 'Alumni',
  network_role: 'member' as const,
  membership_id: 'm1',
};

const lab = {
  id: 'c2',
  slug: 'lab',
  name: 'Lab',
  network_role: 'coordinator' as const,
  membership_id: 'm2',
};

function wrap(node: ReactNode) {
  return (
    <LocaleProvider initialLocale="pt-BR">
      <EnabledModulesProvider enabled={['directory']}>
        <SidebarProvider>{node}</SidebarProvider>
      </EnabledModulesProvider>
    </LocaleProvider>
  );
}

describe('workspace sidebar', () => {
  it('shows the community name without extra seats when there is one membership', () => {
    render(wrap(<AppSidebar email="a@b.c" seats={[alumni]} />));
    expect(screen.getAllByText('Alumni').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /Lab/ })).toBeNull();
  });

  it('marks the community from the URL, not a stale layout current', () => {
    render(wrap(<AppSidebar email="a@b.c" seats={[alumni, lab]} />));
    expect(screen.getByRole('link', { name: /Lab/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: /Alumni/ }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: /Alumni/ }).getAttribute('href')).toBe('/c/alumni/directory');
    expect(screen.getByRole('link', { name: /Perfil nesta comunidade/ }).getAttribute('href')).toBe(
      '/c/lab/profile'
    );
    expect(screen.getByRole('link', { name: /Meu perfil/ }).getAttribute('href')).toBe('/profile');
  });
});
