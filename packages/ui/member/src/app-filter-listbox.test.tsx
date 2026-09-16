import { fireEvent, render, screen } from '@testing-library/react';
import { AppFilterListbox } from './app-filter-listbox';

describe('AppFilterListbox', () => {
  it('renders a scrollable listbox with checkboxes', () => {
    const onChange = vi.fn();
    render(
      <AppFilterListbox
        label="Idiomas"
        options={[
          { value: 'pt', label: 'Português' },
          { value: 'en', label: 'English' },
        ]}
        selected={['pt']}
        onChange={onChange}
      />
    );
    expect(screen.getByRole('listbox', { name: 'Idiomas' })).toBeTruthy();
    expect(document.querySelector('[data-slot="scroll-area"]')?.className).toMatch(/app-filter-listbox-scroll/);
    fireEvent.click(screen.getByRole('checkbox', { name: 'English' }));
    expect(onChange).toHaveBeenCalledWith(['pt', 'en']);
  });
});
