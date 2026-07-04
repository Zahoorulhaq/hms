// components/ui/DrawerFooter.tsx
'use client';

interface DrawerFooterProps {
  onCancel: () => void;
  onSubmit?: () => void; // if using form id, omit this
  formId?: string; // ties submit button to a form by id
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function DrawerFooter({
  onCancel,
  onSubmit,
  formId,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
}: DrawerFooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="btn btn-sm general-border f-12-600 text-muted px-3"
        style={{ borderRadius: 6 }}>
        {cancelLabel}
      </button>
      <button
        type={formId ? 'submit' : 'button'}
        form={formId}
        onClick={onSubmit}
        disabled={loading || disabled}
        className="btn btn-sm f-12-600 px-4"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          borderRadius: 6,
          border: 'none',
          opacity: loading || disabled ? 0.7 : 1,
        }}>
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" />
        ) : (
          submitLabel
        )}
      </button>
    </>
  );
}
