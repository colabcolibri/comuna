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
});
