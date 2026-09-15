import { render, screen } from '@testing-library/react';
import { AppAlertDialog } from './app-alert-dialog';

describe('AppAlertDialog', () => {
  it('renders title, description and actions when open', () => {
    render(
      <AppAlertDialog
        isOpen
        onClose={() => {}}
        title="Sair da sessão?"
        description="Confirme para encerrar."
        cancelLabel="Cancelar"
        confirmLabel="Sair"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText('Sair da sessão?')).toBeTruthy();
    expect(screen.getByText('Confirme para encerrar.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
  });

  it('omits cancel when the notice has a single action', () => {
    render(
      <AppAlertDialog isOpen onClose={() => {}} title="Comando indisponível na demo" confirmLabel="Ok" onConfirm={() => {}} />
    );
    expect(screen.getByRole('button', { name: 'Ok' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
  });
});
