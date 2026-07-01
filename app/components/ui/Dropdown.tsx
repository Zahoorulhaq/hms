// components/ui/Dropdown.tsx
'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type ChildrenFn = (close: () => void) => ReactNode;

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode | ChildrenFn;
  align?: 'left' | 'right';
  minWidth?: number;
}

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  minWidth = 220,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="position-relative">
      <div onClick={() => setOpen((o) => !o)} className='cursor-pointer'>
        {trigger}
      </div>

      {open && (
        <div
          className="general-border rounded-3 bg-white"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [align]: 0,
            minWidth,
            boxShadow: '0 4px 24px rgba(193,98,31,0.13), 0 1px 4px rgba(193,98,31,0.08)',
            zIndex: 999,
            overflow: 'hidden',
            animation: 'dropIn 0.15s ease',
          }}>
          {typeof children === 'function' ? (children as ChildrenFn)(close) : children}
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 f-12-500 ${active ? 'text-white background-primary' : 'text-muted'}`}
      style={{ cursor: 'pointer', transition: 'background 0.12s', userSelect: 'none' }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}>
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <hr className="my-1" style={{ borderColor: 'var(--border-color)' }} />;
}

export function DropdownSection({ children }: { children: ReactNode }) {
  return <div className="py-1">{children}</div>;
}
