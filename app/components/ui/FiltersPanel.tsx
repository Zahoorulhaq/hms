// components/ui/FilterPanel.tsx
'use client';

import { ReactNode } from 'react';
import { MdRefresh } from 'react-icons/md';

interface FilterPanelProps {
  children: ReactNode;
  onReset: () => void;
  activeCount?: number;
}

export default function FilterPanel({ children, onReset, activeCount = 0 }: FilterPanelProps) {
  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      {children}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="btn btn-sm d-flex align-items-center gap-1 f-12-500 text-muted general-border rounded">
          <MdRefresh size={13} />
          Reset ({activeCount})
        </button>
      )}
    </div>
  );
}
