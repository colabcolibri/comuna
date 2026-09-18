import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppSidebar } from '../apps/web/src/components/app/AppSidebar';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';
import { SidebarProvider } from '@community/ui';
import { usePathname } from 'next/navigation';

vi.mocked(usePathname).mockReturnValue('/c/lab/directory');

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
HTMLElement.prototype.setPointerCapture = () => undefined;
HTMLElement.prototype.releasePointerCapture = () => undefined;

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

function wrap(node: ReactNode, defaultOpen = true) {
  return (
    <LocaleProvider initialLocale="pt-BR">
      <EnabledModulesProvider enabled={['directory']}>
        <SidebarProvider defaultOpen={defaultOpen}>{node}</SidebarProvider>
      </EnabledModulesProvider>
    </LocaleProvider>
  );
}

describe('workspace sidebar', () => {
  it('shows the community name without extra seats when there is one membership', () => {
    render(wrap(<AppSidebar email="a@b.c" seats={[alumni]} />));
    expect(screen.getAllByText('Alumni').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /Lab/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Fechar menu/ })).toBeNull();
  });

  it('marks the community from the URL, not a stale layout current', () => {
    render(wrap(<AppSidebar email="a@b.c" seats={[alumni, lab]} />));
    expect(screen.getByRole('link', { name: /Perfil nesta comunidade/ }).getAttribute('href')).toBe(
      '/c/lab/profile'
    );
    expect(screen.getByRole('link', { name: /Meu perfil/ }).getAttribute('href')).toBe('/profile');
    const trigger = screen.getByRole('button', { name: /Lab/ });
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: /Lab/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('menuitem', { name: /Alumni/ }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('menuitem', { name: /Alumni/ }).getAttribute('href')).toBe('/c/alumni/directory');
  });

  it('keeps the community group label as a divider when the rail is collapsed', () => {
    render(wrap(<AppSidebar email="a@b.c" seats={[alumni]} />, false));
    const label = screen.getByText('Nesta comunidade');
    expect(label.getAttribute('data-sidebar')).toBe('group-label');
    expect(label.className).not.toMatch(/-mt-8/);
    expect(label.className).toMatch(/after:h-px/);
    expect(label.className).toMatch(/h-8/);
  });
});
