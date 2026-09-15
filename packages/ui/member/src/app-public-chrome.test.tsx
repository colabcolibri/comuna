import { render, screen } from '@testing-library/react';
import { AppPublicChrome } from './app-public-chrome';

describe('AppPublicChrome', () => {
  it('renders a document header without a sidebar trigger', () => {
    render(
      <AppPublicChrome wordmark={<span>Alumni</span>} tools={<span>idioma</span>} action={<button type="button">Entrar</button>}>
        <p>página</p>
      </AppPublicChrome>
    );
    expect(screen.getByText('Alumni')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByText('página')).toBeTruthy();
    expect(screen.queryByLabelText(/menu/i)).toBeNull();
  });
});
