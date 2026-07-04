// components/ui/Drawer.tsx
'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { MdClose } from 'react-icons/md';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: ReactNode;
  footer?: ReactNode; // custom footer — if omitted no footer rendered
}

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = 'clamp(320px, 45vw, 580px)',
  children,
  footer,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlay}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1040,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          background: '#fff',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          animation: 'drawerSlideIn 0.25s ease',
        }}>
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center px-4 py-3"
          style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--primary-bg)',
            flexShrink: 0,
          }}>
          <div>
            <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
              {title}
            </h6>
            {subtitle && <p className="f-12-500 text-muted mb-0">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              lineHeight: 1,
            }}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-fill overflow-auto thin-scroll px-4 py-3">{children}</div>

        {/* Footer — only rendered if passed */}
        {footer && (
          <div
            className="d-flex justify-content-end align-items-center gap-2 px-4 py-3"
            style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
