import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { parseListField } from '@community/directory';
import { DirectoryPanel } from '../apps/web/src/components/app/DirectoryPanel';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';

const marina = {
  id: 'm1',
  full_name: 'Marina Silva',
  avatar_url: null,
  current_city: { label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' } },
  headline: [{ locale: 'pt-BR', value: 'Produto e comunidades' }],
  bio: [{ locale: 'pt-BR', value: 'Mentora.' }],
  availability_status: 'mentor',
  languages: [{ code: 'pt' }],
  contacts: { linkedin: 'https://linkedin.com/in/demo-marina' },
  custom_attributes: {},
};

const listFields = [
  parseListField({ name: 'full_name', type: 'text', storage: 'person', column_key: 'full_name', placement: 'card' })!,
  parseListField({
    name: 'headline',
    type: 'localized_text',
    storage: 'card_column',
    column_key: 'headline',
    placement: 'card',
  })!,
  parseListField({ name: 'bio', type: 'localized_text', storage: 'card_column', column_key: 'bio', placement: 'detail' })!,
  parseListField({
    name: 'languages',
    type: 'checkbox',
    storage: 'person',
    column_key: 'languages',
    placement: 'card',
  })!,
];

describe('directory panel', () => {
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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists members passed in by the server', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['directory', 'contact-mediated']}>
          <DirectoryPanel
            rows={[marina]}
            facets={[]}
            listFields={listFields}
            search=""
            facetValues={{}}
            cohorts={[]}
            cohort=""
          />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    expect(screen.queryByText('Nenhum membro ativo nesta comunidade.')).toBeNull();
  });

  it('opens the shared profile dialog from a directory row', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['directory', 'contact-mediated']}>
          <DirectoryPanel
            rows={[marina]}
            facets={[]}
            listFields={listFields}
            search=""
            facetValues={{}}
            cohorts={[]}
            cohort=""
          />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    screen.getByRole('button', { name: 'Ver perfil' }).click();
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(screen.getByText('Mentora.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeTruthy();
  });
});
