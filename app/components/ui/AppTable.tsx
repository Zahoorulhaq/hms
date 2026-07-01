// components/ui/AppTable.tsx
'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from 'react-icons/md';

interface AppTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  emptyText?: string;
  stickyFirst?: boolean; // sticky left — ref col
  stickyLast?: boolean; // sticky right — actions col
}

const STICKY_LEFT: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  background: '#fff',
  boxShadow: '2px 0 4px rgba(0,0,0,0.06)',
};

const STICKY_RIGHT: React.CSSProperties = {
  position: 'sticky',
  right: 0,
  zIndex: 2,
  background: '#fff',
  boxShadow: '-2px 0 4px rgba(0,0,0,0.06)',
};

export default function AppTable<T>({
  data,
  columns,
  loading = false,
  emptyText = 'No records found.',
  stickyFirst = false,
  stickyLast = false,
}: AppTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const getColStyle = (idx: number, total: number, isHead = false): React.CSSProperties => {
    const base: React.CSSProperties = isHead
      ? { background: 'var(--primary-bg)' }
      : { background: '#fff' };

    if (stickyFirst && idx === 0)
      return { ...base, ...STICKY_LEFT, ...(isHead ? { background: 'var(--primary-bg)' } : {}) };
    if (stickyLast && idx === total - 1)
      return { ...base, ...STICKY_RIGHT, ...(isHead ? { background: 'var(--primary-bg)' } : {}) };
    return base;
  };

  const headers = table.getHeaderGroups()[0]?.headers ?? [];
  const total = headers.length;

  return (
    <div
      style={{
        overflowX: 'auto', // ← table scrolls horizontally
        overflowY: 'visible',
        WebkitOverflowScrolling: 'touch',
        maxWidth: '100%', // ← never exceeds parent
      }}>
      <table
        className="table table-hover mb-0"
        style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 1200 }}
        // ↑ minWidth on TABLE not on wrapper — this is what creates the scroll
      >
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header, idx) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className="f-12-600 text-muted py-2 px-3"
                    style={{
                      ...getColStyle(idx, total, true),
                      borderBottom: '1px solid var(--border-color)',
                      borderTop: '1px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                      cursor: canSort ? 'pointer' : 'default',
                      userSelect: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                    <div className="d-flex align-items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-muted" style={{ lineHeight: 1 }}>
                          {sorted === 'asc' && <MdArrowUpward size={13} color="var(--primary)" />}
                          {sorted === 'desc' && (
                            <MdArrowDownward size={13} color="var(--primary)" />
                          )}
                          {!sorted && <MdUnfoldMore size={13} />}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-3 py-2">
                    <div
                      className="rounded"
                      style={{
                        height: 13,
                        background: 'var(--primary-muted)',
                        animation: 'pulse 1.4s ease infinite',
                        opacity: 1 - i * 0.1,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-5 text-muted f-12-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2"
                    style={{
                      ...getColStyle(idx, total),
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                    }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.15; }
        }
        .table-hover tbody tr:hover td {
          background: var(--primary-bg) !important;
        }
      `}</style>
    </div>
  );
}
