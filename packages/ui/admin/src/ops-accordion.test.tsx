import { fireEvent, render, screen } from '@testing-library/react';
import { OpsAccordion } from './ops-accordion';

describe('OpsAccordion', () => {
  it('starts closed and reveals the body after the title is clicked', () => {
    render(
      <OpsAccordion value="identity" title="Identidade" actions={<button type="button">Como fica</button>}>
        <p>Campos do grupo</p>
      </OpsAccordion>
    );
    expect(screen.getByRole('button', { name: /Identidade/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Como fica' })).toBeTruthy();
    expect(screen.queryByText('Campos do grupo')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Identidade/ }));
    expect(screen.getByText('Campos do grupo')).toBeTruthy();
  });
});
