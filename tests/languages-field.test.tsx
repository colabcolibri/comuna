import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { coreCatalog } from '@community/directory';
import { LanguagesField } from '../apps/web/src/components/app/LanguagesField';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { useState } from 'react';

function Harness() {
  const field = coreCatalog()
    .flatMap((group) => group.fields)
    .find((item) => item.name === 'languages');
  const [value, setValue] = useState([{ code: 'pt', proficiency: 'native' as const }]);
  if (!field) {
    throw new Error('languages field missing');
  }
  return <LanguagesField field={field} locale="pt-BR" value={value} onChange={setValue} />;
}

describe('languages field', () => {
  it('lists filled languages and lets the person remove one', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Harness />
      </LocaleProvider>
    );
    expect(screen.getByText('Português')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remover Português' }));
    expect(screen.queryByText('Português')).toBeNull();
    expect(screen.getByText('Nenhum idioma ainda.')).toBeTruthy();
  });

  it('loads a row into the insert form for edit', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <Harness />
      </LocaleProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar Português' }));
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
  });
});
