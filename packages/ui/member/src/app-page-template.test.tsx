import { render, screen } from '@testing-library/react';
import { AppPageTemplate } from './app-page-template';

describe('AppPageTemplate', () => {
  it('renders title and subtitle from the caller, not from primitives', () => {
    render(
      <AppPageTemplate title="Diretório" subtitle="Rede intermediada">
        <p>corpo</p>
      </AppPageTemplate>
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Diretório');
    expect(screen.getByText('Rede intermediada')).toBeTruthy();
    expect(screen.getByText('corpo')).toBeTruthy();
  });
});
