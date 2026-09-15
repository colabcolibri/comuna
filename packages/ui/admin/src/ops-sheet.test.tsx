import { fireEvent, render, screen } from '@testing-library/react';
import { OpsSheet } from './ops-sheet';

describe('OpsSheet', () => {
  it('opens from SheetTrigger and closes from SheetClose', () => {
    render(
      <OpsSheet
        trigger={<button type="button">Editar</button>}
        title="Editar campo"
        description="Identificador e exclusão estão travados."
        closeLabel="Cancelar"
        footer={<button type="submit">Salvar</button>}
      >
        <p>corpo</p>
      </OpsSheet>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByText('Identificador e exclusão estão travados.')).toBeTruthy();
    expect(screen.getByText('corpo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  });
});
