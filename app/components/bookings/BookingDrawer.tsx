'use client';

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { MdClose, MdAdd, MdDelete, MdArrowDropDown } from 'react-icons/md';
import { AddBooking } from '@/server/apis/bookings';
import { Toast } from '../Toast';
import { GetRooms } from '@/server/apis/rooms';
import Dropdown, { DropdownItem, DropdownSection } from '../ui/Dropdown';
import { BOOKINGS } from '@/server/endpoints';
import { PATCH_REQUEST, POST_REQUEST, PUT_REQUEST } from '@/server/https';
import Drawer from '../ui/drawer/Drawer';
import DrawerFooter from '../ui/drawer/DrawerFooter';
const RELATIONS = [
  'Wife',
  'Husband',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Friend',
  'Colleague',
  'Uncle',
  'Aunt',
  'Grandfather',
  'Grandmother',
  'Other',
];
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
interface AdditionalGuest {
  name: string;
  father_name: string;
  relation: string;
  nic: string;
  phone: string;
}
interface Booking {
  id: number;
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
  rooms_snapshot: { room_number: string; amount: number }[];
  other_charges: { name: string; amount: number }[];
  discount: number;
  amount_paid: number;
  notes: string;
  rooms: any;
  actual_check_in: string;
  actual_check_out: string;
  additional_guests: AdditionalGuest[];
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
  check_in_time: string;
  check_out: string;
  check_out_time: string;
  adults: number;
  children: number;
  status: string;
  rooms_snapshot: RoomRow[];
  rooms: RoomPivotRow[];
  other_charges: OtherCharge[];
  discount: number;
  amount_paid: number;
  notes: string;
  additional_guests: AdditionalGuest[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: Booking | null;
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

export default function BookingDrawer({ open, onClose, onSuccess, booking }: Props) {
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
      rooms: [],
      other_charges: [],
      check_in: '',
      check_in_time: '14:00',
      check_out: '',
      check_out_time: '11:00',
      additional_guests: [],
    },
  });

  const roomsFieldArray = useFieldArray({ control, name: 'rooms_snapshot' });
  const additionalGuests = useFieldArray({ control, name: 'additional_guests' });
  const aditionGuestVal = watch('additional_guests');
  const visitorType = watch('visitor_type');
  const others = useFieldArray({ control, name: 'other_charges' });
  // Watch current snapshot arrays to update UI layout contextively
  const watchedSnapshot = watch('rooms_snapshot');
  useEffect(() => {
    setValue('adults', aditionGuestVal?.length ? aditionGuestVal?.length + 1 : 1);
  }, [aditionGuestVal]);

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
    setValue(
      'rooms',
      currentPivot.filter((_, i) => i !== idx)
    );
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

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit && booking) {
        const { data: res }: any = await PATCH_REQUEST(BOOKINGS.INDEX + '/' + booking.id, data);
        return res;
      }
      const { data: res }: any = await POST_REQUEST(BOOKINGS.INDEX, data);
      return res;
    },
    onSuccess: () => {
      reset();
      onSuccess();
    },
    onError: (err: any) => {
      Toast.error('Error', err?.response?.data?.message || 'Failed to save booking');
    },
  });

  const onSubmit = (data: BookingForm) => {
    mutation.mutate({
      ...data,
      children: data.children || 0,
      actual_check_in:
        data.check_in && data.check_in_time ? `${data.check_in} ${data.check_in_time}:00` : null,
      actual_check_out:
        data.check_out && data.check_out_time
          ? `${data.check_out} ${data.check_out_time}:00`
          : null,
    });
  };
  function toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.split('T')[0];
  }
  function toTimeInput(value: string | null | undefined): string {
    if (!value) return '';
    const timePart = value.includes('T') ? value.split('T')[1] : value.split(' ')[1];
    if (!timePart) return '';
    return timePart.slice(0, 5); // "HH:MM"
  }
  useEffect(() => {
    if (booking) {
      reset({
        guest_name: booking.guest_name,
        guest_father_name: booking.guest_father_name,
        guest_nic: booking.guest_nic,
        guest_phone: booking.guest_phone,
        guest_profession: booking.guest_profession,
        guest_purpose: booking.guest_purpose,
        guest_city: booking.guest_city,
        guest_address: booking.guest_address,
        guest_country: booking.guest_country,
        visitor_type: booking.visitor_type,
        check_in: toDateInput(booking.check_in),
        check_in_time: booking.actual_check_in ? toTimeInput(booking.actual_check_in) : '14:00',
        check_out: toDateInput(booking.check_out),
        check_out_time: booking.actual_check_out ? toTimeInput(booking.actual_check_out) : '11:00',
        adults: booking.adults,
        children: booking.children || 0,
        status: booking.status,
        rooms_snapshot: booking.rooms_snapshot ?? [{ room_number: '', amount: 0 }],
        other_charges: booking.other_charges ?? [],
        discount: booking.discount || 0,
        amount_paid: booking.amount_paid || 0,
        notes: booking.notes,
        rooms:
          booking?.rooms?.map((r) => ({ room_id: r.room_id, amount: r.price_per_night })) || [],
        additional_guests: booking.additional_guests ?? [],
      });
    } else {
      reset({
        /* default values */
      });
    }
  }, [booking, open, reset]);
  const isEdit = !!booking;
  if (!open) return null;

  return (
     <Drawer
      open     ={open}
      onClose  ={onClose}
      title    ={isEdit ? `Edit Booking — ${booking?.guest_name}` : 'New Booking'}
      subtitle ="Fill in guest and stay details"
      width    ="clamp(320px, 50vw, 680px)"
      footer   ={
        <DrawerFooter
          onCancel    ={onClose}
          formId      ="booking-form"
          submitLabel ={mutation.isPending ? 'Saving…' : isEdit ? 'Update Booking' : 'Save Booking'}
          loading     ={mutation.isPending}
        />
      }
    >
          <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
            {/* ── Guest Info ──────────────────────────────────── */}
            <Section title="Guest Information" />

            <div className="row g-3">
              <div className="col-6">
                <Field label="Full Name *" error={errors.guest_name?.message}>
                  <input
                    className="form-control"
                    {...register('guest_name', { required: 'Required' })}
                  />
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
                  <input
                    className="form-control"
                    {...register('guest_phone', { required: 'Required' })}
                  />
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
                  <select className="form-select form-select" {...register('visitor_type')}>
                    {['single', 'family', 'friends', 'clients'].map((t) => (
                      <option key={t} value={t} className="text-capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Additional Guests ────────────────────────────────── */}
            {visitorType !== 'single' && (
              <>
                <Section title="Additional Guests" />
                {additionalGuests.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="rounded-3 p-3 mb-3"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'var(--primary-bg)',
                    }}>
                    {/* Guest header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="f-12-600" style={{ color: 'var(--text-main)' }}>
                        Guest #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => additionalGuests.remove(idx)}
                        className="btn btn-sm d-flex align-items-center gap-1 f-12-500"
                        style={{
                          color: 'var(--danger)',
                          background: '#ffebee',
                          border: 'none',
                          borderRadius: 6,
                        }}>
                        <MdDelete size={14} /> Remove
                      </button>
                    </div>

                    <div className="row g-2">
                      {/* Name */}
                      <div className="col-6">
                        <label
                          className="form-label f-12-600"
                          style={{ color: 'var(--text-main)' }}>
                          Full Name *
                        </label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Guest name"
                          {...register(`additional_guests.${idx}.name`, { required: true })}
                        />
                        {errors.additional_guests?.[idx]?.name && (
                          <div className="text-danger f-12-500 mt-1">Required</div>
                        )}
                      </div>

                      {/* Father Name — optional */}
                      <div className="col-6">
                        <label
                          className="form-label f-12-600"
                          style={{ color: 'var(--text-main)' }}>
                          Father Name
                          <span className="text-muted fw-normal ms-1">(optional)</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Father's name"
                          {...register(`additional_guests.${idx}.father_name`)}
                        />
                      </div>

                      {/* Relation dropdown */}
                      <div className="col-6">
                        <label
                          className="form-label f-12-600"
                          style={{ color: 'var(--text-main)' }}>
                          Relation *
                        </label>
                        <Dropdown
                          align="left"
                          minWidth={200}
                          trigger={
                            <div
                              className="form-control form-control-sm d-flex justify-content-between align-items-center"
                              style={{ cursor: 'pointer' }}>
                              <span
                                className={
                                  watch(`additional_guests.${idx}.relation`) ? '' : 'text-muted'
                                }>
                                {watch(`additional_guests.${idx}.relation`) || 'Select relation'}
                              </span>
                              <MdArrowDropDown size={16} className="text-muted" />
                            </div>
                          }>
                          {(close: () => void) => (
                            <DropdownSection>
                              {RELATIONS.map((rel) => (
                                <DropdownItem
                                  key={rel}
                                  active={watch(`additional_guests.${idx}.relation`) === rel}
                                  onClick={() => {
                                    setValue(`additional_guests.${idx}.relation`, rel);
                                    close();
                                  }}>
                                  {rel}
                                </DropdownItem>
                              ))}
                            </DropdownSection>
                          )}
                        </Dropdown>
                        {/* Hidden input for validation */}
                        <input
                          type="hidden"
                          {...register(`additional_guests.${idx}.relation`, { required: true })}
                        />
                        {errors.additional_guests?.[idx]?.relation && (
                          <div className="text-danger f-12-500 mt-1">Required</div>
                        )}
                      </div>

                      {/* NIC — optional */}
                      <div className="col-6">
                        <label
                          className="form-label f-12-600"
                          style={{ color: 'var(--text-main)' }}>
                          NIC / Passport
                          <span className="text-muted fw-normal ms-1">(optional)</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="e.g. 35202-1234567-1"
                          {...register(`additional_guests.${idx}.nic`)}
                        />
                      </div>

                      {/* Phone — optional */}
                      <div className="col-6">
                        <label
                          className="form-label f-12-600"
                          style={{ color: 'var(--text-main)' }}>
                          Phone
                          <span className="text-muted fw-normal ms-1">(optional)</span>
                        </label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="e.g. 0300-1234567"
                          {...register(`additional_guests.${idx}.phone`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add guest button */}
                <button
                  type="button"
                  onClick={() =>
                    additionalGuests.append({
                      name: '',
                      relation: '',
                      nic: '',
                      phone: '',
                      father_name: '',
                    })
                  }
                  className="btn btn-sm d-flex align-items-center gap-1 f-12-600 mb-2"
                  style={{
                    color: 'var(--primary)',
                    background: 'var(--primary-bg)',
                    border: '1px dashed var(--primary)',
                    borderRadius: 6,
                  }}>
                  <MdAdd size={15} /> Add Guest
                </button>
                {additionalGuests.fields.length === 0 && (
                  <p className="f-12-500 text-muted mb-3">
                    No additional guests added. Click below to add.
                  </p>
                )}
              </>
            )}

            {/* ── Stay Details ─────────────────────────────────── */}
            <Section title="Stay Details" />

            <div className="row g-3">
              {/* Check In date + time */}
              <div className="col-6">
                <Field label="Check In *" error={errors.check_in?.message}>
                  <input
                    type="date"
                    className="form-control"
                    {...register('check_in', { required: 'Required' })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Check In Time">
                  <input type="time" className="form-control" {...register('check_in_time')} />
                </Field>
              </div>

              {/* Check Out date + time */}
              <div className="col-6">
                <Field label="Check Out *" error={errors.check_out?.message}>
                  <input
                    type="date"
                    className="form-control"
                    {...register('check_out', { required: 'Required' })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Check Out Time">
                  <input type="time" className="form-control" {...register('check_out_time')} />
                </Field>
              </div>

              <div className="col-4">
                <Field label="Adults">
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    {...register('adults', { valueAsNumber: true, min: 1 })}
                  />
                </Field>
              </div>
              {visitorType !== 'single' && (
                <div className="col-4">
                  <Field label="Children">
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      {...register('children', { valueAsNumber: true, min: 0 })}
                    />
                  </Field>
                </div>
              )}
              <div className="col-4">
                <Field label="Status">
                  <select className="form-select" {...register('status')}>
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
                    <div className="w-100">
                      <Dropdown
                        align="left"
                        minWidth={240}
                        trigger={
                          <div className="form-control d-flex justify-content-between align-items-center cursor-pointer w-100">
                            <span
                              className={
                                watchedSnapshot[idx]?.room_number ? 'text-dark' : 'text-muted'
                              }>
                              {watchedSnapshot[idx]?.room_number || 'Select a Room'}
                            </span>
                            <MdArrowDropDown size={18} className="text-muted" />
                          </div>
                        }>
                        {(close) => (
                          <DropdownSection>
                            {isLoading ? (
                              <div className="px-3 py-2 f-12-500 text-muted">Loading rooms...</div>
                            ) : availableRooms.length === 0 ? (
                              <div className="px-3 py-2 f-12-500 text-muted">
                                No rooms available
                              </div>
                            ) : (
                              availableRooms.map((roomItem: any) => (
                                <DropdownItem
                                  key={roomItem.id}
                                  active={
                                    watchedSnapshot[idx]?.room_number === roomItem.room_number
                                  }
                                  onClick={() => handleRoomSelection(idx, roomItem, close)}>
                                  Room {roomItem.room_number} ({roomItem.type || 'Standard'}) — Rs.
                                  {roomItem.price || roomItem.amount || 0}
                                </DropdownItem>
                              ))
                            )}
                          </DropdownSection>
                        )}
                      </Dropdown>
                    </div>
                    {/* Hidden inputs keep values validated cleanly within React Hook Form */}
                    <input
                      type="hidden"
                      {...register(`rooms_snapshot.${idx}.room_number`, {
                        required: 'Select a room',
                      })}
                    />
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
                        },
                      })}
                    />
                  </Field>
                </div>
                {roomsFieldArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRoomRow(idx)}
                    className="btn btn-sm mb-3"
                    style={{
                      color: 'var(--danger)',
                      background: '#ffebee',
                      border: 'none',
                      borderRadius: 6,
                    }}>
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
              }}>
              <MdAdd size={15} /> Add room
            </button>

            {/* ── Other Charges ─────────────────────────────────── */}
            <Section title="Other Charges" />

            {others.fields.map((field, idx) => (
              <div key={field.id} className="d-flex align-items-end gap-2 mb-2">
                <div className="flex-fill">
                  <Field label={idx === 0 ? 'Description' : ''}>
                    <input
                      className="form-control"
                      placeholder="e.g. Laundry"
                      {...register(`other_charges.${idx}.name`, { required: true })}
                    />
                  </Field>
                </div>
                <div style={{ width: 130 }}>
                  <Field label={idx === 0 ? 'Amount' : ''}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      {...register(`other_charges.${idx}.amount`, { valueAsNumber: true })}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => others.remove(idx)}
                  className="btn btn-sm mb-3"
                  style={{
                    color: 'var(--danger)',
                    background: '#ffebee',
                    border: 'none',
                    borderRadius: 6,
                  }}>
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
              }}>
              <MdAdd size={15} /> Add Charge
            </button>

            {/* ── Financials ────────────────────────────────────── */}
            <Section title="Financials" />

            <div className="row g-3">
              <div className="col-6">
                <Field label="Discount (Rs.)">
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    {...register('discount', { valueAsNumber: true })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Amount Paid (Rs.)">
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    {...register('amount_paid', { valueAsNumber: true })}
                  />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Notes">
                  <textarea className="form-control" rows={3} {...register('notes')} />
                </Field>
              </div>
            </div>
          </form>
       </Drawer>
  );
}
