import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { coreCatalog } from '@community/directory';
import ProfileEditPage from '../apps/web/src/app/profile/edit/page';
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
          { locale: 'pt-BR', value: 'Headline' },
          { locale: 'en', value: 'Headline' },
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
      {
        name: 'bio',
        type: 'localized_text',
        label: [
          { locale: 'pt-BR', value: 'Bio' },
          { locale: 'en', value: 'Bio' },
        ],
        description: [],
        options: [],
        span: 1,
        required: false,
        sort_order: 20,
        storage: 'card_column',
        column_key: 'bio',
        filterable: false,
      },
    ],
  },
  {
    slug: 'availability',
    label: [
      { locale: 'pt-BR', value: 'Disponibilidade' },
      { locale: 'en', value: 'Availability' },
    ],
    description: [],
    sort_order: 40,
    columns: 1,
    fields: [
      {
        name: 'availability_status',
        type: 'select',
        label: [
          { locale: 'pt-BR', value: 'Disponibilidade' },
          { locale: 'en', value: 'Availability' },
        ],
        description: [],
        options: [{ value: 'available_for_hire', label: [{ locale: 'pt-BR', value: 'Hire' }, { locale: 'en', value: 'Hire' }] }],
        span: 1,
        required: false,
        sort_order: 10,
        storage: 'card_column',
        column_key: 'availability_status',
        filterable: false,
      },
    ],
  },
];

describe('profile edit fields', () => {
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
              bio: [
                { locale: 'pt-BR', value: 'B' },
                { locale: 'en', value: 'B' },
              ],
              availability_status: 'available_for_hire',
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

  it('shows identity contract fields and directory extras', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <ProfileEditPage />
      </LocaleProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Nome completo')).toBeTruthy();
    });
    expect(screen.getByLabelText('URL do avatar')).toBeTruthy();
    expect(screen.getByLabelText('Gênero')).toBeTruthy();
    expect(screen.getByLabelText('Cidade de nascimento')).toBeTruthy();
    expect(screen.getByLabelText('Cidade onde mora')).toBeTruthy();
    expect(screen.getByLabelText('Headline (pt-BR)')).toBeTruthy();
    expect(screen.getByLabelText('Headline (en)')).toBeTruthy();
    expect(screen.getByLabelText('Bio (pt-BR)')).toBeTruthy();
    expect(screen.getByLabelText('Bio (en)')).toBeTruthy();
    expect(screen.getByLabelText('Disponibilidade')).toBeTruthy();
  });
});
