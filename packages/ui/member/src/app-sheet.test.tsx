import { fireEvent, render, screen } from '@testing-library/react';
import { AppSheet } from './app-sheet';

describe('AppSheet', () => {
  it('opens from SheetTrigger and closes from SheetClose', () => {
    render(
      <AppSheet
        trigger={<button type="button">Enviar mensagem</button>}
        title="Enviar mensagem"
        description="Ajuda do formulário"
        closeLabel="Cancelar"
        footer={<button type="submit">Enviar</button>}
      >
        <p>corpo</p>
      </AppSheet>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
    expect(screen.getByText('Ajuda do formulário')).toBeTruthy();
    expect(screen.getByText('corpo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  });
});
