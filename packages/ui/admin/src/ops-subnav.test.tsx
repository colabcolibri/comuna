import { render, screen } from '@testing-library/react';
import { OpsSubnav } from './ops-subnav';

describe('OpsSubnav', () => {
  it('marks the active chapter', () => {
    render(
      <OpsSubnav
        items={[
          { href: '/communities/1/settings', label: 'Dados', active: true },
          { href: '/communities/1/fields', label: 'Campos' },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Dados' }).className).toContain('border-mark');
    expect(screen.getByRole('link', { name: 'Campos' }).className).not.toContain('border-mark');
  });
});
