// app/(dashboard)/bookings/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import AppTable from '@/components/ui/AppTable';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/ui/FiltersPanel';
import { FilterSelect, FilterAmountRange, FilterDateRange } from '@/components/ui/FilterFields';
import BookingDrawer from '@/components/bookings/BookingDrawer';
import type { PaginationMeta } from '@/components/ui/Pagination';
import { MdEdit, MdVisibility } from 'react-icons/md';
import { GetRooms } from '@/server/apis/rooms';
import { GetBookings } from '@/server/apis/bookings';

// ── Types & helpers (same as before) ─────────────────────────────
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
  rooms:any;
  actual_check_in:string;
  actual_check_out:string
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  reserved: { label: 'Reserved', bg: '#fff3e0', color: '#e65100' },
  checked_in: { label: 'Checked In', bg: '#e8f5e9', color: '#2e7d32' },
  checked_out: { label: 'Checked Out', bg: '#e3f2fd', color: '#1565c0' },
  cancelled: { label: 'Cancelled', bg: '#ffebee', color: '#c62828' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#f5f5f5', color: '#666' };
  return (
    <span
      className="rounded-pill px-2 py-1 f-12-600"
      style={{ background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Filter state type ─────────────────────────────────────────────
interface BookingFilters {
  status: string;
  visitor_type: string;
  room_id: string;
  date_from: Date | null;
  date_to: Date | null;
  amount_min: string;
  amount_max: string;
}

const DEFAULT_FILTERS: BookingFilters = {
  status: '',
  visitor_type: '',
  room_id: '',
  date_from: null,
  date_to: null,
  amount_min: '',
  amount_max: '',
};

// ── Page ──────────────────────────────────────────────────────────
export default function BookingsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_FILTERS);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  // ── Columns ───────────────────────────────────────────────────────
  const COLUMNS: ColumnDef<Booking, any>[] = useMemo(
    () => [
      {
        accessorKey: 'ref',
        header: 'Ref',
        enableSorting: false,
        cell: (i) => (
          <Link
            href={`/bookings/${i.row.original.id}`}
            className="f-12-600 text-decoration-none"
            style={{ color: 'var(--primary)' }}>
            {i.getValue()}
          </Link>
        ),
      },
      {
        accessorKey: 'guest_name',
        header: 'Guest Name',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-500" style={{ color: 'var(--text-main)' }}>
            {i.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'guest_phone',
        header: 'Phone',
        enableSorting: false,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'guest_city',
        header: 'City',
        enableSorting: true,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'visitor_type',
        header: 'Visit Type',
        enableSorting: false,
        cell: (i) => <span className="f-12-500 text-capitalize text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'check_in',
        header: 'Check In',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-500" style={{ color: 'var(--text-main)' }}>
            {fmt(i.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'check_out',
        header: 'Check Out',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-500" style={{ color: 'var(--text-main)' }}>
            {fmt(i.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'nights',
        header: 'Nights',
        enableSorting: true,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'adults',
        header: 'Adults',
        enableSorting: false,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: (i) => <StatusBadge status={i.getValue()} />,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-600" style={{ color: 'var(--text-main)' }}>
            Rs. {Number(i.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'amount_paid',
        header: 'Paid',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-600 text-success">Rs. {Number(i.getValue()).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'amount_due',
        header: 'Due',
        enableSorting: true,
        cell: (i) => {
          const due = Number(i.getValue());
          return (
            <span className={`f-12-600 ${due > 0 ? 'text-danger' : 'text-success'}`}>
              Rs. {due.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        enableSorting: true,
        cell: (i) => <span className="f-12-500 text-muted">{fmt(i.getValue())}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: (i) => (
          <div className="d-flex align-items-center gap-2">
            <Link
              href={`/bookings/${i.row.original.id}`}
              style={{ color: 'var(--primary)', lineHeight: 1 }}>
              <MdVisibility size={17} />
            </Link>
            <button
              onClick={() => {
                setDrawerOpen(true);
                setEditingBooking(i.row.original);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                lineHeight: 1,
                padding: 0,
              }}>
              <MdEdit size={17} />
            </button>
          </div>
        ),
      },
    ],
    []
  );
  // Count active filters for badge
  const activeCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== '' && v !== null).length,
    [filters]
  );

  // Fetch rooms for dropdown
  const { data: rooms } = GetRooms({ filters: {} });

  // Build AND filter array
  const buildFilter = useCallback(() => {
    const conditions: any[] = [];

    if (search.trim()) conditions.push({ field: 'guest_name', op: '_like_', value: search.trim() });
    if (filters.status) conditions.push({ field: 'status', op: '=', value: filters.status });
    if (filters.visitor_type)
      conditions.push({ field: 'visitor_type', op: '=', value: filters.visitor_type });
    if (filters.room_id)
      conditions.push({ field: 'room_id', op: '=', value: Number(filters.room_id) });
    if (filters.date_from)
      conditions.push({
        field: 'check_in',
        op: '>=',
        value: format(filters.date_from, 'yyyy-MM-dd'),
      });
    if (filters.date_to)
      conditions.push({
        field: 'check_in',
        op: '<=',
        value: format(filters.date_to, 'yyyy-MM-dd'),
      });
    if (filters.amount_min)
      conditions.push({ field: 'amount', op: '>=', value: Number(filters.amount_min) });
    if (filters.amount_max)
      conditions.push({ field: 'amount', op: '<=', value: Number(filters.amount_max) });

    return conditions.length ? JSON.stringify({ AND: conditions }) : {};
  }, [search, filters]);

  const { data, isLoading } = GetBookings({
    page,
    limit,
    filters: buildFilter(),
    sort: { created_at: 'desc' },
  });

  const bookings: Booking[] = data?.data ?? [];
  const meta: PaginationMeta = data?.meta;

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  };

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
              Bookings
            </h5>
            <p className="f-12-500 text-muted mb-0">
              {meta?.total?.toLocaleString() ?? '—'} total records
            </p>
          </div>
          <button
            className="btn btn-sm f-12-600 px-3 py-2"
            style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8 }}
            onClick={() => setDrawerOpen(true)}>
            + New Booking
          </button>
        </div>
        {/* Search + filter toggle */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control-sm f-12-500"
            placeholder="Search guest name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 260, border: '1px solid var(--border-color)', borderRadius: 6 }}
          />
          {search && (
            <button
              className="btn btn-sm f-12-500 text-muted general-border rounded"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}>
              Clear
            </button>
          )}
          <FilterPanel onReset={resetFilters} activeCount={activeCount}>
            {/* Status */}
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(v) => {
                setFilters((f) => ({ ...f, status: v }));
                setPage(1);
              }}
              options={[
                { label: 'Reserved', value: 'reserved' },
                { label: 'Checked In', value: 'checked_in' },
                { label: 'Checked Out', value: 'checked_out' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />

            {/* Visitor Type */}
            <FilterSelect
              label="Visitor Type"
              value={filters.visitor_type}
              onChange={(v) => {
                setFilters((f) => ({ ...f, visitor_type: v }));
                setPage(1);
              }}
              options={[
                { label: 'Single', value: 'single' },
                { label: 'Family', value: 'family' },
                { label: 'Friends', value: 'friends' },
                { label: 'Clients', value: 'clients' },
              ]}
            />

            {/* Room */}
            <FilterSelect
              label="Room"
              value={filters.room_id}
              onChange={(v) => {
                setFilters((f) => ({ ...f, room_id: v }));
                setPage(1);
              }}
              options={rooms?.map((r: any) => ({
                label: `${r.room_number} (${r.room_type})`,
                value: String(r.id),
              }))}
              placeholder="All Rooms"
            />

            {/* Amount range */}
            <FilterAmountRange
              minVal={filters.amount_min}
              maxVal={filters.amount_max}
              onMinChange={(v) => {
                setFilters((f) => ({ ...f, amount_min: v }));
                setPage(1);
              }}
              onMaxChange={(v) => {
                setFilters((f) => ({ ...f, amount_max: v }));
                setPage(1);
              }}
            />

            {/* Date range */}
            <FilterDateRange
              from={filters.date_from}
              to={filters.date_to}
              onFromChange={(d) => {
                setFilters((f) => ({ ...f, date_from: d }));
                setPage(1);
              }}
              onToChange={(d) => {
                setFilters((f) => ({ ...f, date_to: d }));
                setPage(1);
              }}
            />
          </FilterPanel>
        </div>
        {/* Table card */}
        <div
          className="bg-white rounded-3 general-border general-box-shadow"
          style={{ overflow: 'hidden' }}>
          <AppTable<Booking>
            data={bookings}
            columns={COLUMNS}
            loading={isLoading}
            emptyText="No bookings found."
            stickyFirst
            stickyLast
          />

          {meta && (
            <Pagination
              meta={meta}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      <BookingDrawer
        open={drawerOpen}
        booking={editingBooking}
        onClose={() => {
          setEditingBooking(null);
          setDrawerOpen(false);
        }}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditingBooking(null);
          qc.invalidateQueries({ queryKey: ['bookings'] });
        }}
      />
    </>
  );
}
