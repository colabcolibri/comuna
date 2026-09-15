import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { coreCatalog } from '@community/directory';
import { ProfileForm } from '../apps/web/src/components/app/ProfileForm';
import { LocaleProvider } from '@/components/app/LocaleProvider';

const catalogGroups = [
  ...coreCatalog(),
  {
    slug: 'community_copy',
    label: [
      { locale: 'pt-BR', value: 'Nesta comunidade' },
      { locale: 'en', value: 'This community' },
    ],
    description: [],
    sort_order: 30,
    columns: 1,
    fields: [
      {
        name: 'headline',
        type: 'localized_text',
        label: [
          { locale: 'pt-BR', value: 'Título' },
          { locale: 'en', value: 'Title' },
        ],
        description: [],
        options: [],
        span: 1,
        required: false,
        sort_order: 10,
        storage: 'card_column',
        column_key: 'headline',
        filterable: false,
      },
    ],
  },
];

describe('profile forms', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes('/api/directory/catalog')) {
          return { ok: true, status: 200, json: async () => ({ groups: catalogGroups }) };
        }
        if (url.includes('/api/profiles/me')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              profile: {
                full_name: 'Ada',
                avatar_url: '',
                gender: 'woman',
                languages: [{ code: 'pt', proficiency: 'native' }],
                contacts: {},
              },
            }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            card: {
              headline: [
                { locale: 'pt-BR', value: 'H' },
                { locale: 'en', value: 'H' },
              ],
              bio: [],
              availability_status: null,
              custom_attributes: {},
            },
          }),
        };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows only person fields on the account profile', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <ProfileForm scope="person" />
      </LocaleProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Nome completo')).toBeTruthy();
    });
    expect(screen.getByRole('heading', { name: 'Nome e foto' })).toBeTruthy();
    expect(screen.getByLabelText('Foto')).toBeTruthy();
    expect(screen.getByText('Obrigatório')).toBeTruthy();
    expect(screen.getAllByText('Opcional').length).toBeGreaterThan(0);
    expect(screen.getByText('Português')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remover Português' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Adicionar novo idioma' })).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Português' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar' }).closest('.sticky')).toBeTruthy();
  });

  it('shows only community fields on the tenant profile', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <ProfileForm scope="community" />
      </LocaleProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Título (pt-BR)')).toBeTruthy();
    });
    expect(screen.queryByLabelText('Nome completo')).toBeNull();
  });
});
