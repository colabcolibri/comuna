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
    expect(screen.getByLabelText('Idioma preferido')).toBeTruthy();
    expect(screen.getByLabelText('Headline')).toBeTruthy();
    expect(screen.getByLabelText('Bio')).toBeTruthy();
    expect(screen.getByLabelText('Disponibilidade')).toBeTruthy();
  });
});
