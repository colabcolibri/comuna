import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DirectoryPage from '../apps/web/src/app/directory/page';
import { LocaleProvider } from '@/components/app/LocaleProvider';

describe('directory page', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        if (url.includes('/api/directory/catalog')) {
          return { ok: true, status: 200, json: async () => ({ groups: [] }) };
        }
        if (url.includes('/api/directory/members')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              data: [
                {
                  id: 'm1',
                  full_name: 'Marina Silva',
                  avatar_url: null,
                  current_city: { label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' } },
                  headline: null,
                  availability_status: 'mentor',
                },
              ],
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists active members from the directory API', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <DirectoryPage />
      </LocaleProvider>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    });
    expect(screen.queryByText('Nenhum membro ativo nesta comunidade.')).toBeNull();
  });
});
