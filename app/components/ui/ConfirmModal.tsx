// components/ui/ConfirmModal.tsx
'use client';

import { MdWarning } from 'react-icons/md';

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1060,
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1070,
          width: 'min(420px, 90vw)',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
        <div className="p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <MdWarning size={22} color="var(--danger)" />
            </div>
            <div>
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                {title}
              </h6>
              <p className="f-12-500 text-muted mb-0 mt-1">{message}</p>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              onClick={onCancel}
              className="btn btn-sm general-border f-12-600 text-muted px-3"
              style={{ borderRadius: 6 }}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-sm f-12-600 px-4"
              style={{
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: 6,
                border: 'none',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
