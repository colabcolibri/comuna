import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DemoMemberLogin } from './DemoMemberLogin';

vi.mock('@/components/app/LocaleProvider', () => ({
  useLocale: () => 'pt-BR',
}));

describe('DemoMemberLogin', () => {
  it('shows one demo email and a single enter action', () => {
    render(<DemoMemberLogin />);
    expect(screen.getByText('member01@demo.example')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
    expect(screen.queryByText('member02@demo.example')).toBeNull();
  });
});
