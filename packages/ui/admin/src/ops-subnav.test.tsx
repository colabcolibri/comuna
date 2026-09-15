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
    const dados = screen.getByRole('link', { name: 'Dados' });
    expect(dados.querySelector('.bg-mark')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Campos' }).querySelector('.bg-mark')).toBeNull();
  });
});
