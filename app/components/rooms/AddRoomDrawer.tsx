'use client';

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { MdClose, MdAdd, MdDelete, MdArrowDropDown } from 'react-icons/md';
import { AddBooking } from '@/server/apis/bookings';
import { Toast } from '../Toast';
import { AddRoom, GetRooms } from '@/server/apis/rooms';
import Dropdown, { DropdownItem, DropdownSection } from '../ui/Dropdown';

// ── Types ─────────────────────────────────────────────────────────

interface RoomForm {
  room_number: string;
  capacity: number;
  price_per_night: string;
  room_type: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function Section({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-4">
      <div className="f-12-600 text-muted text-uppercase" style={{ letterSpacing: '0.06em' }}>
        {title}
      </div>
      <hr className="mt-1 mb-0" style={{ borderColor: 'var(--border-color)' }} />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="form-label f-12-600" style={{ color: 'var(--text-main)' }}>
        {label}
      </label>
      {children}
      {error && <div className="text-danger f-12-500 mt-1">{error}</div>}
    </div>
  );
}

export default function BookingDrawer({ open, onClose, onSuccess }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoomForm>({
    defaultValues: {
      room_number: '',
      capacity: 1,
      price_per_night: '',
      room_type: 'standard',
    },
  });

  
  // Watch current snapshot arrays to update UI layout contextively

  // Fetch active inventory items natively
  const { data: roomsData, isLoading } = GetRooms({ filters: {} });
  const availableRooms = roomsData || [];

  // Close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Reset on close
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const { mutate: AddRoomMutation, isPending } = useMutation({
    mutationFn: AddRoom,
    onSuccess: () => {
      Toast.success('success', 'Added successfully.');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to add room:', error);
      Toast.error('error', error?.response?.data?.message || 'Failed to add room.');
    },
  });

  const onSubmit = (data: RoomForm) => AddRoomMutation(data);

  if (!open) return null;

  return (
    <>
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

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'clamp(320px, 50vw, 680px)',
          background: '#fff',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.25s ease',
        }}>
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center px-4 py-3"
          style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--primary-bg)',
          }}>
          <div>
            <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
              New Room
            </h6>
            <p className="f-12-500 text-muted mb-0">Fill in room details</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-fill overflow-auto px-4 py-3">
          <form id="room-form" onSubmit={handleSubmit(onSubmit)}>
            {/* ── Guest Info ──────────────────────────────────── */}

            <div className="row g-3">
              <div className="col-6">
                <Field label="Room number *" error={errors.room_number?.message}>
                  <input placeholder='i.e V101, S101' className="form-control" {...register('room_number', { required: 'Required' })} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Capacity *" error={errors.capacity?.message}>
                  <input type='number' min={0} className="form-control" {...register('capacity', { required: 'Required' })} />
                </Field>
              </div>
             
              <div className="col-6">
                <Field label="Price per night *" error={errors.price_per_night?.message}>
                  <input placeholder='Enter price per night of the room' type='number' min={0} className="form-control" {...register('price_per_night', { required: 'Required' })} />
                </Field>
              </div>
            
              <div className="col-6">
                <Field label="Room type *">
                  <select className="form-select form-select" {...register('room_type', { required: 'Required' })} value={watch().room_type}>
                    {['suit', 'standard', 'vip', 'shop'].map((t) => (
                      <option key={t} value={t} className="text-capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>


          </form>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-end align-items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button type="button" onClick={onClose} className="btn btn-sm general-border f-12-600 text-muted px-3" style={{ borderRadius: 6 }}>
            Cancel
          </button>
          <button
            type="submit"
            form="room-form"
            disabled={isSubmitting || isPending}
            className="btn btn-sm f-12-600 px-4"
            style={{
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 6,
              border: 'none',
              opacity: isSubmitting || isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Adding...' : 'Add Room'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}