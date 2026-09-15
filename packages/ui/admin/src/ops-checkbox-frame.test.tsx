import { render, screen } from '@testing-library/react';
import { OpsCheckboxFrame } from './ops-checkbox-frame';

describe('OpsCheckboxFrame', () => {
  it('wraps the control in a select-sized box', () => {
    render(
      <OpsCheckboxFrame htmlFor="ops-filter">
        <input id="ops-filter" type="checkbox" />
      </OpsCheckboxFrame>
    );
    expect(screen.getByRole('checkbox').parentElement?.className).toMatch(/border-input/);
    expect(screen.getByRole('checkbox').parentElement?.className).toMatch(/justify-center/);
  });
});
