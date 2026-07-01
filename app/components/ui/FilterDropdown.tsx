// components/ui/FilterDropdown.tsx
'use client';

import { ReactNode } from 'react';
import Dropdown, { DropdownSection } from '@/components/ui/Dropdown';
import { MdExpandMore } from 'react-icons/md';

interface FilterDropdownProps {
  label: string;
  active?: boolean; // highlights trigger when a value is selected
  value?: string; // display value on trigger
  children: ReactNode | ((close: () => void) => ReactNode);
  minWidth?: number;
  align?: 'left' | 'right';
}

export default function FilterDropdown({
  label,
  active = false,
  value,
  children,
  minWidth = 240,
  align = 'left',
}: FilterDropdownProps) {
  const trigger = (
    <button
      className="d-flex align-items-center gap-1 rounded-2 px-2 py-1 f-12-500 general-border"
      style={{
        background: active ? 'var(--primary-bg)' : '#fff',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: active ? 600 : 400,
        border: active ? '1px solid var(--primary)' : undefined,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
      {label}
      {value && (
        <span className="f-12-600" style={{ color: 'var(--primary)' }}>
          : {value}
        </span>
      )}
      <MdExpandMore size={14} />
    </button>
  );

  return (
    <Dropdown trigger={trigger} align={align} minWidth={minWidth}>
      {children}
    </Dropdown>
  );
}
