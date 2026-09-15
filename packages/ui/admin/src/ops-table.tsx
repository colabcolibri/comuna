import type { ReactNode } from 'react';

export function OpsTable<T>({
  columns,
  rows,
  empty,
  rowKey,
}: {
  columns: { id: string; header: string; className?: string; cell: (row: T) => ReactNode }[];
  rows: T[];
  empty: string;
  rowKey: (row: T) => string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-secondary/60">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-border hover:bg-secondary/40">
              {columns.map((column) => (
                <td key={column.id} className={`px-4 py-3.5 min-w-0 ${column.className ?? ''}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
