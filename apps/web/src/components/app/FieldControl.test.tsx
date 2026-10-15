import { render, screen } from '@testing-library/react';
import { FieldControl } from './FieldControl';

const booleanField = {
  name: 'public_directory',
  type: 'boolean' as const,
  label: [{ locale: 'pt-BR' as const, value: 'Mostrar no diretório interno' }],
  description: [{ locale: 'pt-BR' as const, value: 'Não controla a vitrine.' }],
  required: false,
  localized: false,
  options: [],
  storage: 'card_column' as const,
  column_key: 'public_directory',
  span: 1 as const,
  sort_order: 25,
  enabled: true,
  module_slug: 'directory',
};

describe('FieldControl', () => {
  it('renders boolean fields with the AppSwitcher, not a checkbox', () => {
    const { container } = render(
      <FieldControl
        field={booleanField}
        locale="pt-BR"
        value
        onChange={() => {}}
        pairPt="{label} (pt-BR)"
        pairEn="{label} (en)"
      />
    );

    expect(screen.getByText('Mostrar no diretório interno')).toBeTruthy();
    expect(screen.getByText('Não controla a vitrine.')).toBeTruthy();
    expect(screen.getByRole('switch')).toBeTruthy();
    expect(container.querySelector('[data-slot="switch"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="checkbox"]')).toBeNull();
  });
});
