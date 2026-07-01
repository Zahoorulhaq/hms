// components/ui/Pagination.tsx
'use client';

import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 15, 25, 50, 100];

export default function Pagination({
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (!meta) return null;

  const { total, from, to, last_page, has_more } = meta;

  // Build page numbers with ellipsis
  const getPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (last_page <= 7) {
      return Array.from({ length: last_page }, (_, i) => i + 1);
    }
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < last_page - 2) pages.push('...');
    pages.push(last_page);
    return pages;
  };

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    border: '1px solid var(--border-color)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    transition: 'all 0.12s',
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: 'var(--primary)',
    color: '#fff',
    border: '1px solid var(--primary)',
    fontWeight: 600,
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div
      className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2"
      style={{ borderTop: '1px solid var(--border-color)' }}>
      {/* Left — showing X to Y of Z */}
      <div className="d-flex align-items-center gap-3">
        <span className="f-12-500 text-muted">
          {from && to
            ? `Showing ${from}–${to} of ${total.toLocaleString()} records`
            : `${total.toLocaleString()} records`}
        </span>

        {/* Items per page */}
        <div className="d-flex align-items-center gap-1">
          <span className="f-12-500 text-muted">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="form-select form-select-sm f-12-500"
            style={{
              width: 64,
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              color: 'var(--text-main)',
              paddingRight: 20,
            }}>
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <span className="f-12-500 text-muted">per page</span>
        </div>
      </div>

      {/* Right — page controls */}
      <div className="d-flex align-items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          style={page === 1 ? btnDisabled : btnBase}
          title="First page">
          <MdFirstPage size={16} />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={page === 1 ? btnDisabled : btnBase}
          title="Previous page">
          <MdChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="f-12-500 text-muted px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              style={p === page ? btnActive : btnBase}>
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_more}
          style={!has_more ? btnDisabled : btnBase}
          title="Next page">
          <MdChevronRight size={16} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(last_page)}
          disabled={page === last_page}
          style={page === last_page ? btnDisabled : btnBase}
          title="Last page">
          <MdLastPage size={16} />
        </button>
      </div>
    </div>
  );
}
