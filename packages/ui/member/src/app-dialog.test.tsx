import { render, screen } from '@testing-library/react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader } from './app-dialog';
import { AppPersonCard, AppShowcaseCard } from './app-showcase-card';

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
    expect(document.querySelector('[data-slot="scroll-area"]')?.className).toMatch(/app-dialog-scroll/);
    expect(document.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeTruthy();
    expect(screen.getByText('Enviar')).toBeTruthy();
  });
});

describe('AppShowcaseCard', () => {
  it('shows name, headline and a languages block', () => {
    render(
      <AppShowcaseCard
        name="Marina Silva"
        headline="Produto"
        summary="Desenha produtos para redes profissionais."
        city="São Paulo, Brasil"
        languagesLabel="Idiomas"
        languages={['Português', 'Inglês']}
        availability="Mentoria"
        availabilityLabel="Disponibilidade"
        facts={[{ label: 'Recebe em casa', values: [] }]}
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
    expect(screen.getByText('Idiomas')).toBeTruthy();
    expect(screen.getByText('Português')).toBeTruthy();
    expect(screen.getByText('Inglês')).toBeTruthy();
    expect(screen.getByText('Mentoria')).toBeTruthy();
    expect(screen.getByText('Disponibilidade')).toBeTruthy();
    expect(screen.getByText('Recebe em casa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver perfil: Marina Silva' })).toBeTruthy();
  });

  it('keeps compact cards short: no bio, facts, or field headings', () => {
    render(
      <AppPersonCard
        variant="compact"
        name="Marina Silva"
        headline="Produto"
        summary="Desenha produtos para redes profissionais."
        city="São Paulo, Brasil"
        languagesLabel="Idiomas"
        languages={['Português', 'Inglês']}
        availability="Mentoria"
        availabilityLabel="Disponibilidade"
        facts={[{ label: 'Recebe em casa', values: [] }]}
        actionLabel="Ver perfil"
        onOpen={() => undefined}
      />
    );
    expect(screen.getByText('Produto')).toBeTruthy();
    expect(screen.queryByText('Desenha produtos para redes profissionais.')).toBeNull();
    expect(screen.queryByText('Idiomas')).toBeNull();
    expect(screen.queryByText('Disponibilidade')).toBeNull();
    expect(screen.queryByText('Recebe em casa')).toBeNull();
    expect(screen.getByText('Mentoria')).toBeTruthy();
    expect(screen.getByText('Português')).toBeTruthy();
  });
});
