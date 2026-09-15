import { render, screen } from '@testing-library/react';
import { AppPageTemplate } from './app-page-template';
import { AppIndexList, AppPersonRow } from './app-person-row';

describe('AppPageTemplate', () => {
  it('renders kicker, title, lede and actions', () => {
    render(
      <AppPageTemplate kicker="Rede" title="Diretório" subtitle="Rede intermediada" actions={<button type="button">Filtrar</button>}>
        <p>corpo</p>
      </AppPageTemplate>
    );
    expect(screen.getByText('Rede')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Diretório');
    expect(screen.getByText('Rede intermediada')).toBeTruthy();
    expect(screen.getByText('Filtrar')).toBeTruthy();
    expect(screen.getByText('corpo')).toBeTruthy();
  });
});

describe('AppPersonRow', () => {
  it('shows name and initials from the composed template', () => {
    render(
      <AppIndexList>
        <AppPersonRow name="Marina Silva" headline="Produto" status="Disponível" />
      </AppIndexList>
    );
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Marina Silva');
    expect(screen.getByText('MS')).toBeTruthy();
    expect(screen.getByText('Produto')).toBeTruthy();
  });
});
