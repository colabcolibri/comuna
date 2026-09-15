import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileEditPage from '../apps/web/src/app/profile/edit/page';
import { LocaleProvider } from '@/components/app/LocaleProvider';

describe('profile edit fields', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows identity contract fields and directory extras', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <ProfileEditPage />
      </LocaleProvider>
    );
    expect(screen.getByLabelText('Nome completo')).toBeTruthy();
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
