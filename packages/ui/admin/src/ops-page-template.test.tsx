import { render, screen } from '@testing-library/react';
import { OpsPageTemplate } from './ops-page-template';
import { OpsSection } from './ops-section';

describe('OpsPageTemplate', () => {
  it('renders kicker, title, lede and actions like the member page template', () => {
    render(
      <OpsPageTemplate
        kicker="Ops"
        title="Comunidades"
        subtitle="Tenants da rede"
        actions={<button type="button">Adicionar nova</button>}
      >
        <p>lista</p>
      </OpsPageTemplate>
    );
    expect(screen.getByText('Ops')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Comunidades');
    expect(screen.getByText('Tenants da rede')).toBeTruthy();
    expect(screen.getByText('Adicionar nova')).toBeTruthy();
    expect(screen.getByText('lista')).toBeTruthy();
  });

  it('renders an outline back button when backHref is set', () => {
    render(
      <OpsPageTemplate backHref="/communities" backLabel="Voltar" backAriaLabel="Todas as comunidades" title="Demo">
        <p>detalhe</p>
      </OpsPageTemplate>
    );
    const back = screen.getByRole('link', { name: 'Todas as comunidades' });
    expect(back.getAttribute('href')).toBe('/communities');
    expect(back.textContent).toContain('Voltar');
  });
});

describe('OpsSection', () => {
  it('renders a section heading and body', () => {
    render(
      <OpsSection title="Plugins" description="Liga ou desliga o que a comunidade usa.">
        <p>directory</p>
      </OpsSection>
    );
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Plugins');
    expect(screen.getByText('Liga ou desliga o que a comunidade usa.')).toBeTruthy();
    expect(screen.getByText('directory')).toBeTruthy();
  });
});
