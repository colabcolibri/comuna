import { render, screen } from '@testing-library/react';
import { OpsDialog, OpsDialogBody, OpsDialogHeader } from './ops-dialog';

describe('OpsDialog', () => {
  it('renders header and body', () => {
    render(
      <OpsDialog open onClose={() => undefined} size="xl">
        <OpsDialogHeader title="Como fica" description="Silhueta do perfil em tela larga." />
        <OpsDialogBody>
          <p>Foto</p>
        </OpsDialogBody>
      </OpsDialog>
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Como fica' })).toBeTruthy();
    expect(screen.getByText('Silhueta do perfil em tela larga.')).toBeTruthy();
    expect(screen.getByText('Foto')).toBeTruthy();
    expect(document.querySelector('[data-slot="scroll-area"]')).toBeTruthy();
  });
});
