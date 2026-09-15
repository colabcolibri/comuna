import { render, screen } from '@testing-library/react';
import { OpsShell } from './ops-shell';

describe('OpsShell', () => {
  it('renders communities nav and sign out without member chrome copy', () => {
    render(
      <OpsShell brand="Ops" communitiesLabel="Comunidades" signOutLabel="Sair" onSignOut={() => undefined}>
        <p>workspace</p>
      </OpsShell>
    );
    expect(screen.getByRole('link', { name: 'Comunidades' }).getAttribute('href')).toBe('/communities');
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
    expect(screen.getByText('workspace')).toBeTruthy();
    expect(screen.queryByText('Community')).toBeNull();
  });
});
