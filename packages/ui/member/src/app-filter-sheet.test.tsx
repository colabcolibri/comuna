import { fireEvent, render, screen } from '@testing-library/react';
import { AppFilterSheet } from './app-filter-sheet';

describe('AppFilterSheet', () => {
  it('opens from the trigger like the shadcn sheet demo', () => {
    render(
      <AppFilterSheet
        trigger={<button type="button">Abrir</button>}
        title="Filtros"
        description="Afinar a lista"
        clearLabel="Limpar"
        closeLabel="Fechar"
        onClear={() => {}}
      >
        <p>Turma</p>
      </AppFilterSheet>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByText('Filtros')).toBeTruthy();
    expect(screen.getByText('Afinar a lista')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy();
    expect(screen.getByText('Turma')).toBeTruthy();
  });
});
