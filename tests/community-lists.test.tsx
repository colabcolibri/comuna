import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CommunityLists } from '../apps/admin/components/community-lists';
import { LocaleProvider } from '../apps/admin/components/locale-provider';

vi.mock('@/lang/catalog', async () => {
  const mod = await import('../apps/admin/lang/catalog');
  return { uiCatalog: mod.uiCatalog };
});

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
HTMLElement.prototype.setPointerCapture = () => undefined;
HTMLElement.prototype.releasePointerCapture = () => undefined;

function wrap(node: ReactNode) {
  return <LocaleProvider initialLocale="pt-BR">{node}</LocaleProvider>;
}

describe('community lists', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [
            {
              fieldId: 'name',
              name: 'full_name',
              type: 'text',
              label: { 'pt-BR': 'Nome completo' },
              canFilter: false,
              filterable: false,
              placement: 'card',
              placementLocked: true,
            },
            {
              fieldId: 'langs',
              name: 'languages',
              type: 'checkbox',
              label: { 'pt-BR': 'Idiomas que fala' },
              canFilter: true,
              filterable: true,
              placement: 'card',
              placementLocked: false,
            },
          ],
        }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('aligns filter and placement in table columns', async () => {
    render(wrap(<CommunityLists communityId="c1" listKey="showcase" />));
    await waitFor(() => {
      expect(screen.getByText('Nome completo')).toBeTruthy();
    });
    expect(screen.getByRole('columnheader', { name: 'Campo' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Filtrar' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Onde aparece' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Filtrar' })).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getByRole('table')).toBeTruthy();
  });
});
