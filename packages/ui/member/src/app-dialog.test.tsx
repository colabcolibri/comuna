import { render, screen } from '@testing-library/react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader } from './app-dialog';
import { AppShowcaseCard } from './app-showcase-card';

describe('AppDialog', () => {
  it('renders header, body and footer', () => {
    render(
      <AppDialog open onClose={() => undefined} size="lg">
        <AppDialogHeader title="Marina Silva" description="Produto" />
        <AppDialogBody>
          <p>Bio pública</p>
        </AppDialogBody>
        <AppDialogFooter>
          <button type="button">Cancelar</button>
          <button type="submit">Enviar</button>
        </AppDialogFooter>
      </AppDialog>
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    expect(screen.getByText('Produto')).toBeTruthy();
    expect(screen.getByText('Bio pública')).toBeTruthy();
    expect(document.querySelector('[data-slot="scroll-area"]')).toBeTruthy();
    expect(screen.getByText('Enviar')).toBeTruthy();
  });
});

describe('AppShowcaseCard', () => {
  it('shows name, headline and chips', () => {
    render(
      <AppShowcaseCard
        name="Marina Silva"
        headline="Produto"
        summary="Desenha produtos para redes profissionais."
        city="São Paulo, Brasil"
        chips={['Mentoria', 'Português']}
        actionLabel="Ver perfil"
        onOpen={() => undefined}
      />
    );
    expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    expect(screen.getByText('São Paulo, Brasil').compareDocumentPosition(screen.getByText('Produto'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getByText('Produto').compareDocumentPosition(screen.getByText('Desenha produtos para redes profissionais.'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getByRole('button', { name: 'Ver perfil: Marina Silva' })).toBeTruthy();
  });
});
