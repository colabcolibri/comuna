import { render, screen } from '@testing-library/react';
import { OpsShell } from './ops-shell';

describe('OpsShell', () => {
  it('renders network nav without member chrome copy', () => {
    render(
      <OpsShell
        brand="Ops"
        groups={[{ label: 'Rede', items: [{ href: '/communities', label: 'Comunidades', active: true }] }]}
        signOutLabel="Sair"
        menuLabel="Abrir menu"
        onSignOut={() => undefined}
      >
        <p>workspace</p>
      </OpsShell>
    );
    expect(screen.getByText('Rede')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Comunidades' }).getAttribute('href')).toBe('/communities');
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
    expect(screen.getByText('workspace')).toBeTruthy();
    expect(document.querySelector('[data-slot="scroll-area"]')).toBeTruthy();
    expect(screen.queryByText('Community')).toBeNull();
    expect(screen.queryByText('Dados')).toBeNull();
  });

  it('adds tenant chapters only after a community is open', () => {
    render(
      <OpsShell
        brand="Ops"
        groups={[
          { label: 'Rede', items: [{ href: '/communities', label: 'Comunidades' }] },
          {
            label: 'Nesta comunidade',
            items: [
              { href: '/communities/c1/settings', label: 'Dados', active: true },
              { href: '/communities/c1/modules', label: 'Plugins' },
            ],
          },
        ]}
        signOutLabel="Sair"
        menuLabel="Abrir menu"
        onSignOut={() => undefined}
      >
        <p>detalhe</p>
      </OpsShell>
    );
    expect(screen.getByText('Nesta comunidade')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Dados' }).getAttribute('href')).toBe('/communities/c1/settings');
    expect(screen.getByRole('link', { name: 'Plugins' })).toBeTruthy();
  });

  it('uses a custom link component for chapter items', () => {
    function FakeLink({ href, children }: { href: string; children?: React.ReactNode }) {
      return (
        <a href={href} data-soft="1">
          {children}
        </a>
      );
    }
    render(
      <OpsShell
        brand="Ops"
        groups={[{ items: [{ href: '/communities', label: 'Comunidades' }] }]}
        linkComponent={FakeLink}
        signOutLabel="Sair"
        menuLabel="Abrir menu"
        onSignOut={() => undefined}
      >
        <p>x</p>
      </OpsShell>
    );
    expect(screen.getByRole('link', { name: 'Comunidades' }).getAttribute('data-soft')).toBe('1');
  });
});
