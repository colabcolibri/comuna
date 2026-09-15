import { render, screen } from '@testing-library/react';
import { OpsIconButton } from './ops-icon-button';

describe('OpsIconButton', () => {
  it('keeps the label on the control, not as visible text', () => {
    render(
      <OpsIconButton label="Renomear">
        <span data-testid="icon" />
      </OpsIconButton>
    );
    const button = screen.getByRole('button', { name: 'Renomear' });
    expect(button.textContent).not.toContain('Renomear');
    expect(button.querySelector('[data-testid="icon"]')).toBeTruthy();
  });
});
