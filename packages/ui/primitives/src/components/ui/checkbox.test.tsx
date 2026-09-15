import { render } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('renders the shadcn checkbox, not a native input', () => {
    const { container } = render(<Checkbox aria-label="on" />);
    expect(container.querySelector('[data-slot="checkbox"]')).toBeTruthy();
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
  });
});
