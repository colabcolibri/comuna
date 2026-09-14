import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { AppCardTemplate } from './AppCardTemplate';
import { AppAlertTemplate } from './AppAlertTemplate';
import { AppDialogTemplate } from './AppDialogTemplate';
import { AppSheetTemplate } from './AppSheetTemplate';

describe('Composed Templates', () => {
  it('renders AppCardTemplate with title and content', () => {
    render(
      <AppCardTemplate
        title="Perfil Alumni"
        subtitle="Engenheiro de Software"
        content={<p>Conteúdo do perfil</p>}
        footer={<button>Ver mais</button>}
      />
    );
    expect(screen.getByText('Perfil Alumni')).toBeDefined();
    expect(screen.getByText('Engenheiro de Software')).toBeDefined();
    expect(screen.getByText('Conteúdo do perfil')).toBeDefined();
    expect(screen.getByText('Ver mais')).toBeDefined();
  });

  it('renders AppAlertTemplate with variant title and message', () => {
    render(
      <AppAlertTemplate variant="success" title="Sucesso" message="Perfil salvo com sucesso!" />
    );
    expect(screen.getByText('Sucesso')).toBeDefined();
    expect(screen.getByText('Perfil salvo com sucesso!')).toBeDefined();
  });

  it('renders AppDialogTemplate when open', () => {
    render(
      <AppDialogTemplate
        isOpen={true}
        onClose={() => {}}
        title="Confirmar Ação"
        content={<p>Deseja aprovar?</p>}
        actions={<button>Aprovar</button>}
      />
    );
    expect(screen.getByText('Confirmar Ação')).toBeDefined();
    expect(screen.getByText('Deseja aprovar?')).toBeDefined();
    expect(screen.getByText('Aprovar')).toBeDefined();
  });

  it('renders AppSheetTemplate when open', () => {
    render(
      <AppSheetTemplate
        isOpen={true}
        onClose={() => {}}
        title="Filtros Avancados"
        content={<p>Campos de filtro</p>}
      />
    );
    expect(screen.getByText('Filtros Avancados')).toBeDefined();
    expect(screen.getByText('Campos de filtro')).toBeDefined();
  });
});
