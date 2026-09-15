import { render, screen } from '@testing-library/react';
import { AppPageTemplate } from './app-page-template';
import { AppIndexList, AppPersonRow } from './app-person-row';
import { AppProfileSection, AppProfileStack } from './app-profile-section';
import { AppShowcasePortal } from './app-showcase-portal';

describe('AppPageTemplate', () => {
  it('renders kicker, title, lede and actions', () => {
    render(
      <AppPageTemplate kicker="Rede" title="Diretório" subtitle="Pessoas desta comunidade" actions={<button type="button">Filtrar</button>}>
        <p>corpo</p>
      </AppPageTemplate>
    );
    expect(screen.getByText('Rede')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Diretório');
    expect(screen.getByText('Pessoas desta comunidade')).toBeTruthy();
    expect(screen.getByText('Filtrar')).toBeTruthy();
    expect(screen.getByText('corpo')).toBeTruthy();
  });
});

describe('AppShowcasePortal', () => {
  it('uses the community name as the page heading', () => {
    render(
      <AppShowcasePortal title="Pessoas da rede" lede="Quem optou por aparecer.">
        <p>grelha</p>
      </AppShowcasePortal>
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Pessoas da rede');
    expect(screen.getByText('Quem optou por aparecer.')).toBeTruthy();
    expect(screen.getByText('grelha')).toBeTruthy();
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

describe('AppProfileSection', () => {
  it('renders a section heading without wrapping the fields in a card', () => {
    render(
      <AppProfileStack>
        <AppProfileSection title="Identidade" description="Nome e foto.">
          <p>campo</p>
        </AppProfileSection>
      </AppProfileStack>
    );
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Identidade');
    expect(screen.getByText('Nome e foto.')).toBeTruthy();
    expect(screen.getByText('campo')).toBeTruthy();
  });
});
