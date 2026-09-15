import { render, screen } from '@testing-library/react';
import { OpsMoveButtons } from './ops-move-buttons';

describe('OpsMoveButtons', () => {
  it('exposes order as labeled icon buttons, not visible subir/descer copy', () => {
    render(
      <OpsMoveButtons
        moveUp="Subir"
        moveDown="Descer"
        canUp
        canDown={false}
        onMove={() => undefined}
      />
    );
    const up = screen.getByRole('button', { name: 'Subir' }) as HTMLButtonElement;
    const down = screen.getByRole('button', { name: 'Descer' }) as HTMLButtonElement;
    expect(up.disabled).toBe(false);
    expect(down.disabled).toBe(true);
    expect(up.textContent).not.toContain('Subir');
  });
});
