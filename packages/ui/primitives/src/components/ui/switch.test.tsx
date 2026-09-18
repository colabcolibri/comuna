import { render } from '@testing-library/react';
import { Switch } from './switch';

describe('Switch', () => {
  it('renders the shadcn switch, not a native checkbox', () => {
    const { container } = render(<Switch aria-label="on" />);
    expect(container.querySelector('[data-slot="switch"]')).toBeTruthy();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });
});
