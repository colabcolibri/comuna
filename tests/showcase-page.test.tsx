import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ShowcasePanel } from '../apps/web/src/components/app/ShowcasePanel';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';

const marina = {
  id: 'm1',
  full_name: 'Marina Silva',
  avatar_url: null,
  headline: [{ locale: 'pt-BR', value: 'Produto e comunidades' }],
  bio: [{ locale: 'pt-BR', value: 'Mentora.' }],
  current_city: { label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' } },
  languages: [{ code: 'pt' }, { code: 'en' }],
  contacts: { linkedin: 'https://linkedin.com/in/demo-marina' },
  availability_status: 'mentor',
  custom_attributes: { host_at_home: true },
};

describe('showcase panel', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('min-width: 640px'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({}),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a showcase card and opens the profile dialog', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['showcase', 'contact-mediated']}>
          <ShowcasePanel rows={[marina]} />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    expect(screen.getByText('Mentora.')).toBeTruthy();
    screen.getByRole('button', { name: 'Ver perfil' }).click();
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeTruthy();
    expect(screen.queryByLabelText('Seu e-mail')).toBeNull();
    screen.getByRole('button', { name: 'Enviar mensagem' }).click();
    await waitFor(() => {
      expect(screen.getByLabelText('Seu e-mail')).toBeTruthy();
    });
  });
});
