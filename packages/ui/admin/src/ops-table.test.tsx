import { render, screen } from '@testing-library/react';
import { OpsTable } from './ops-table';

describe('OpsTable', () => {
  it('renders headers and cells', () => {
    render(
      <OpsTable
        columns={[
          { id: 'name', header: 'Nome', cell: (row: { id: string; name: string }) => row.name },
        ]}
        rows={[{ id: '1', name: 'Demo' }]}
        empty="vazio"
        rowKey={(row) => row.id}
      />
    );
    expect(screen.getByText('Nome')).toBeTruthy();
    expect(screen.getByText('Demo')).toBeTruthy();
  });

  it('shows empty copy when there are no rows', () => {
    render(
      <OpsTable
        columns={[{ id: 'name', header: 'Nome', cell: () => null }]}
        rows={[]}
        empty="Nenhuma comunidade."
        rowKey={() => 'x'}
      />
    );
    expect(screen.getByText('Nenhuma comunidade.')).toBeTruthy();
  });
});
