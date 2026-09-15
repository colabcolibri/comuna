import { render, screen } from '@testing-library/react';
import { OpsTabs } from './ops-tabs';

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
HTMLElement.prototype.setPointerCapture = () => undefined;
HTMLElement.prototype.releasePointerCapture = () => undefined;

describe('OpsTabs', () => {
  it('renders kind labels as tabs, not a select', () => {
    render(
      <OpsTabs
        ariaLabel="Tipo"
        value="member_otp"
        onValueChange={() => undefined}
        items={[
          { value: 'member_otp', label: 'OTP membro' },
          { value: 'ops_otp', label: 'OTP ops' },
        ]}
      />
    );
    expect(screen.getByRole('tablist', { name: 'Tipo' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'OTP membro' }).getAttribute('data-state')).toBe('active');
    expect(screen.getByRole('tab', { name: 'OTP ops' }).getAttribute('data-state')).toBe('inactive');
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});
