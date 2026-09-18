import { render, screen } from '@testing-library/react';
import { AppSwitcher } from './app-switcher';

describe('AppSwitcher', () => {
  it('renders label, status, description and the switch primitive', () => {
    const { container } = render(
      <AppSwitcher
        id="field-public-showcase"
        label="Mostrar na vitrine pública"
        status="Opcional"
        description="Se esta comunidade tem vitrine, o cartão só entra com o seu sim."
        checked
        onCheckedChange={() => {}}
      />
    );

    expect(screen.getByText('Mostrar na vitrine pública')).toBeTruthy();
    expect(screen.getByText('Opcional')).toBeTruthy();
    expect(screen.getByText('Se esta comunidade tem vitrine, o cartão só entra com o seu sim.')).toBeTruthy();
    expect(container.querySelector('[data-slot="switch"]')).toBeTruthy();
    expect(screen.getByRole('switch')).toBeTruthy();
  });
});
