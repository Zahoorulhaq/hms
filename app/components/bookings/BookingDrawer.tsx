'use client';

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { MdClose, MdAdd, MdDelete, MdArrowDropDown } from 'react-icons/md';
import { AddBooking } from '@/server/apis/bookings';
import { Toast } from '../Toast';
import { GetRooms } from '@/server/apis/rooms';
import Dropdown, { DropdownItem, DropdownSection } from '../ui/Dropdown';

// ── Types ─────────────────────────────────────────────────────────
interface RoomRow {
  room_number: string;
  amount: number;
}
interface RoomPivotRow {
  room_id: string;
  amount: number;
}

interface OtherCharge {
  name: string;
  amount: number;
}

interface BookingForm {
  guest_name: string;
  guest_father_name: string;
  guest_nic: string;
  guest_phone: string;
  guest_profession: string;
  guest_purpose: string;
  guest_city: string;
  guest_address: string;
  guest_country: string;
  visitor_type: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  status: string;
  rooms_snapshot: RoomRow[];
  rooms: RoomPivotRow[];
  other_charges: OtherCharge[];
  discount: number;
  amount_paid: number;
  notes: string;
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
  } = useForm<BookingForm>({
    defaultValues: {
      guest_country: 'Pakistan',
      visitor_type: 'single',
      status: 'reserved',
      adults: 1,
      children: 0,
      discount: 0,
      amount_paid: 0,
      rooms_snapshot: [{ room_number: '', amount: 0 }],
      rooms: [{ room_id: '', amount: 0 }],
      other_charges: [],
    },
  });

  const roomsFieldArray = useFieldArray({ control, name: 'rooms_snapshot' });
  const others = useFieldArray({ control, name: 'other_charges' });
  
  // Watch current snapshot arrays to update UI layout contextively
  const watchedSnapshot = watch('rooms_snapshot');

  // Fetch active inventory items natively
  const { data: roomsData, isLoading } = GetRooms({ filters: {} });
  const availableRooms = roomsData || [];

  // Sync snapshot append and delete variants to primary matching pivot records
  const handleAddRoomRow = () => {
    roomsFieldArray.append({ room_number: '', amount: 0 });
    // Append matching payload slot explicitly for Pivot array 
    const currentPivot = watch('rooms') || [];
    setValue('rooms', [...currentPivot, { room_id: '', amount: 0 }]);
  };

  const handleRemoveRoomRow = (idx: number) => {
    roomsFieldArray.remove(idx);
    const currentPivot = watch('rooms') || [];
    setValue('rooms', currentPivot.filter((_, i) => i !== idx));
  };

  const handleRoomSelection = (idx: number, roomItem: any, closeDropdown: () => void) => {
    // 1. Sync human readable snapshot data references
    setValue(`rooms_snapshot.${idx}.room_number`, roomItem.room_number);
    setValue(`rooms_snapshot.${idx}.amount`, roomItem.price ?? roomItem.amount ?? 0);

    // 2. Sync corresponding strict database relations references
    setValue(`rooms.${idx}.room_id`, roomItem.id);
    setValue(`rooms.${idx}.amount`, roomItem.price ?? roomItem.amount ?? 0);

    closeDropdown();
  };

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

  const { mutate: AddBookingMutation, isPending } = useMutation({
    mutationFn: AddBooking,
    onSuccess: () => {
      Toast.success('success', 'Added successfully.');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Failed to add booking:', error);
      Toast.error('error', error?.response?.data?.message || 'Failed to add booking.');
    },
  });

  const onSubmit = (data: BookingForm) => AddBookingMutation(data);

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
              New Booking
            </h6>
            <p className="f-12-500 text-muted mb-0">Fill in guest and stay details</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-fill overflow-auto px-4 py-3">
          <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
            {/* ── Guest Info ──────────────────────────────────── */}
            <Section title="Guest Information" />

            <div className="row g-3">
              <div className="col-6">
                <Field label="Full Name *" error={errors.guest_name?.message}>
                  <input className="form-control" {...register('guest_name', { required: 'Required' })} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Father Name">
                  <input className="form-control" {...register('guest_father_name')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="NIC / Passport">
                  <input className="form-control" {...register('guest_nic')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Phone *" error={errors.guest_phone?.message}>
                  <input className="form-control" {...register('guest_phone', { required: 'Required' })} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Profession">
                  <input className="form-control" {...register('guest_profession')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Purpose">
                  <input className="form-control" {...register('guest_purpose')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="City">
                  <input className="form-control" {...register('guest_city')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Country">
                  <input className="form-control" {...register('guest_country')} />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Address">
                  <input className="form-control" {...register('guest_address')} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Visitor Type">
                  <select className="form-select form-select-sm" {...register('visitor_type')}>
                    {['single', 'family', 'friends', 'clients'].map((t) => (
                      <option key={t} value={t} className="text-capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Stay Details ─────────────────────────────────── */}
            <Section title="Stay Details" />

            <div className="row g-3">
              <div className="col-6">
                <Field label="Check In *" error={errors.check_in?.message}>
                  <input type="date" className="form-control" {...register('check_in', { required: 'Required' })} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Check Out *" error={errors.check_out?.message}>
                  <input type="date" className="form-control" {...register('check_out', { required: 'Required' })} />
                </Field>
              </div>
              <div className="col-4">
                <Field label="Adults">
                  <input type="number" min={1} className="form-control" {...register('adults', { valueAsNumber: true, min: 1 })} />
                </Field>
              </div>
              <div className="col-4">
                <Field label="Children">
                  <input type="number" min={0} className="form-control" {...register('children', { valueAsNumber: true, min: 0 })} />
                </Field>
              </div>
              <div className="col-4">
                <Field label="Status">
                  <select className="form-select form-select-sm" {...register('status')}>
                    {['reserved', 'checked_in', 'checked_out', 'cancelled'].map((s) => (
                      <option key={s} value={s} className="text-capitalize">
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Rooms Dropdown Conversion ────────────────────── */}
            <Section title="Rooms" />

            {roomsFieldArray.fields.map((field, idx) => (
              <div key={field.id} className="d-flex align-items-end gap-2 mb-2">
                <div className="flex-fill">
                  <Field label={idx === 0 ? 'Room Number' : ''}>
                    <div className='w-100'>
                    <Dropdown
                      align="left"
                      minWidth={240}
                      trigger={
                        <div className="form-control d-flex justify-content-between align-items-center cursor-pointer w-100">
                          <span className={watchedSnapshot[idx]?.room_number ? 'text-dark' : 'text-muted'}>
                            {watchedSnapshot[idx]?.room_number || 'Select a Room'}
                          </span>
                          <MdArrowDropDown size={18} className="text-muted" />
                        </div>
                      }
                    >
                      
                      {(close) => (
                        <DropdownSection>
                          {isLoading ? (
                            <div className="px-3 py-2 f-12-500 text-muted">Loading rooms...</div>
                          ) : availableRooms.length === 0 ? (
                            <div className="px-3 py-2 f-12-500 text-muted">No rooms available</div>
                          ) : (
                            availableRooms.map((roomItem: any) => (
                              <DropdownItem
                                key={roomItem.id}
                                active={watchedSnapshot[idx]?.room_number === roomItem.room_number}
                                onClick={() => handleRoomSelection(idx, roomItem, close)}
                              >
                                Room {roomItem.room_number} ({roomItem.type || 'Standard'}) — Rs.{roomItem.price || roomItem.amount || 0}
                              </DropdownItem>
                            ))
                          )}
                        </DropdownSection>
                      )}
                    </Dropdown>
                    </div>
                    {/* Hidden inputs keep values validated cleanly within React Hook Form */}
                    <input type="hidden" {...register(`rooms_snapshot.${idx}.room_number`, { required: 'Select a room' })} />
                    <input type="hidden" {...register(`rooms.${idx}.room_id`)} />
                  </Field>
                </div>
                
                <div style={{ width: 130 }}>
                  <Field label={idx === 0 ? 'Price / Night' : ''}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      {...register(`rooms_snapshot.${idx}.amount`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          // Mirror input value modifications directly to the sibling Pivot configuration hook
                          setValue(`rooms.${idx}.amount`, Number(e.target.value));
                        }
                      })}
                    />
                  </Field>
                </div>
                {roomsFieldArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoomRow(idx)}
                    className="btn btn-sm mb-3"
                    style={{ color: 'var(--danger)', background: '#ffebee', border: 'none', borderRadius: 6 }}
                  >
                    <MdDelete size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddRoomRow}
              className="btn btn-sm d-flex align-items-center gap-1 f-12-600 mb-2"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-bg)',
                border: '1px dashed var(--primary)',
                borderRadius: 6,
              }}
            >
              <MdAdd size={15} /> Add Room
            </button>

            {/* ── Other Charges ─────────────────────────────────── */}
            <Section title="Other Charges" />

            {others.fields.map((field, idx) => (
              <div key={field.id} className="d-flex align-items-end gap-2 mb-2">
                <div className="flex-fill">
                  <Field label={idx === 0 ? 'Description' : ''}>
                    <input className="form-control" placeholder="e.g. Laundry" {...register(`other_charges.${idx}.name`, { required: true })} />
                  </Field>
                </div>
                <div style={{ width: 130 }}>
                  <Field label={idx === 0 ? 'Amount' : ''}>
                    <input type="number" className="form-control" placeholder="0" {...register(`other_charges.${idx}.amount`, { valueAsNumber: true })} />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => others.remove(idx)}
                  className="btn btn-sm mb-3"
                  style={{ color: 'var(--danger)', background: '#ffebee', border: 'none', borderRadius: 6 }}
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => others.append({ name: '', amount: 0 })}
              className="btn btn-sm d-flex align-items-center gap-1 f-12-600 mb-2"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-bg)',
                border: '1px dashed var(--primary)',
                borderRadius: 6,
              }}
            >
              <MdAdd size={15} /> Add Charge
            </button>

            {/* ── Financials ────────────────────────────────────── */}
            <Section title="Financials" />

            <div className="row g-3">
              <div className="col-6">
                <Field label="Discount (Rs.)">
                  <input type="number" min={0} className="form-control" {...register('discount', { valueAsNumber: true })} />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Amount Paid (Rs.)">
                  <input type="number" min={0} className="form-control" {...register('amount_paid', { valueAsNumber: true })} />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Notes">
                  <textarea className="form-control" rows={3} {...register('notes')} />
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
            form="booking-form"
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
            {isPending ? 'Saving…' : 'Save Booking'}
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