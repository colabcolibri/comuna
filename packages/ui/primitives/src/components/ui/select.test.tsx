import { render, screen } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
  it('renders the shadcn trigger, not a native select', () => {
    render(
      <Select>
        <SelectTrigger aria-label="pick">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole('combobox', { name: 'pick' })).toBeTruthy();
    expect(document.querySelector('select')).toBeNull();
  });
});
