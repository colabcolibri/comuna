import { render, screen } from '@testing-library/react';
import { OpsAlertDialog } from './ops-alert-dialog';

describe('OpsAlertDialog', () => {
  it('renders title, description and actions when open', () => {
    render(
      <OpsAlertDialog
        isOpen
        onClose={() => {}}
        title="Excluir este campo?"
        description="Só depois de desativar."
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText('Excluir este campo?')).toBeTruthy();
    expect(screen.getByText('Só depois de desativar.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeTruthy();
  });
});
