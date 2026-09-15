import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { OpsCombobox, type OpsComboboxOption } from './ops-combobox';

function Harness({ options }: { options: OpsComboboxOption[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  return (
    <div>
      <OpsCombobox
        query={query}
        onQueryChange={setQuery}
        options={options}
        selectedId={selectedId}
        onSelect={(option) => {
          setSelectedId(option.id);
          setQuery(option.label);
        }}
        placeholder="Buscar"
        empty="Nenhum"
      />
      {selectedId ? <p>sel:{selectedId}</p> : null}
    </div>
  );
}

describe('OpsCombobox', () => {
  it('lets the operator pick a hit without dumping a native select', () => {
    render(
      <Harness options={[{ id: 'u1', label: 'Marina Silva', detail: 'member01@demo.example' }]} />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mar' } });
    fireEvent.click(screen.getByRole('option', { name: /Marina Silva/ }));
    expect(screen.getByText('sel:u1')).toBeTruthy();
  });
});
