import { render, screen } from '@testing-library/react';
import { OpsBadge } from './ops-badge';

describe('OpsBadge', () => {
  it('renders as a distinct label, not inline text', () => {
    render(
      <p>
        Serginho
        <OpsBadge title="Super-admin da rede">Admin</OpsBadge>
      </p>
    );
    const badge = screen.getByText('Admin');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.getAttribute('title')).toBe('Super-admin da rede');
    expect(badge.getAttribute('aria-label')).toBe('Super-admin da rede');
    expect(badge.className).toContain('border');
  });
});
