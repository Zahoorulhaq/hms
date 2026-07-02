// app/(dashboard)/rooms/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import AppTable from '@/components/ui/AppTable';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/ui/FiltersPanel';
import { FilterSelect, FilterAmountRange, FilterDateRange } from '@/components/ui/FilterFields';

import { MdEdit, MdVisibility, MdDelete } from 'react-icons/md';
import { GetRooms } from '@/server/apis/rooms';
import AddRoomDrawer from '@/components/rooms/AddRoomDrawer';

// ── Types & helpers (same as before) ─────────────────────────────
interface Room {
  id: number;
  room_number: string;
  ref: string;
  room_type: string;
  status: string;
  price_per_night: number;
  capacity: number;
  floor: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  reserved: { label: 'Reserved', bg: '#fff3e0', color: '#e65100' },
  available: { label: 'Available', bg: '#e3f2fd', color: '#1565c0' },
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

// ── Filter state type ─────────────────────────────────────────────
interface RoomFilters {
  status: string;
  capacity_min: string;
  capacity_max: string;
  price_min: string;
  price_max: string;
  floor: string;
}

const DEFAULT_FILTERS: RoomFilters = {
  status: '',
  capacity_min: '',
  capacity_max: '',
  price_min: '',
  price_max: '',
  floor: '',
};

export default function RoomsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_FILTERS);
  const columns: ColumnDef<Room, any>[] = useMemo(
    () => [
      {
        accessorKey: 'ref',
        header: 'Ref',
        enableSorting: false,
        cell: (i) => (
          <span className="f-12-600" style={{ color: 'var(--primary)' }}>
            {i.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'room_number',
        header: 'Room No.',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-600" style={{ color: 'var(--text-main)' }}>
            {i.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'room_type',
        header: 'Type',
        enableSorting: true,
        cell: (i) => (
          <span
            className="rounded-pill px-2 py-1 f-12-600 text-capitalize"
            style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
            {i.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'floor',
        header: 'Floor',
        enableSorting: true,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue() ?? '—'}</span>,
      },
      {
        accessorKey: 'capacity',
        header: 'Capacity',
        enableSorting: false,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()} guests</span>,
      },
      {
        accessorKey: 'price_per_night',
        header: 'Price / Night',
        enableSorting: true,
        cell: (i) => (
          <span className="f-12-600" style={{ color: 'var(--text-main)' }}>
            Rs. {Number(i.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: (i) => <StatusBadge status={i.getValue()} />,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        enableSorting: false,
        cell: (i) => (
          <span
            className="f-12-500 text-muted"
            style={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}>
            {i.getValue() || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: (i) => (
          <div className="d-flex align-items-center gap-2">
            <button
              title="Edit"
              onClick={() => {
                setEditRoom(i.row.original);
                setDrawerOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary)',
                lineHeight: 1,
                padding: 0,
              }}>
              <MdEdit size={17} />
            </button>
            <button
              title="Delete"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--danger)',
                lineHeight: 1,
                padding: 0,
              }}>
              <MdDelete size={17} />
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

  // Build AND filter array
  const buildFilter = useCallback(() => {
    const conditions: any[] = [];

    if (filters.status) conditions.push({ field: 'status', op: '=', value: filters.status });

    if (filters.price_min)
      conditions.push({
        field: 'price_per_night',
        op: '>=',
        value: Number(filters.price_min),
      });
    if (filters.price_max)
      conditions.push({
        field: 'price_per_night',
        op: '<=',
        value: Number(filters.price_max),
      });
    if (filters.capacity_min)
      conditions.push({ field: 'capacity', op: '>=', value: Number(filters.capacity_min) });
    if (filters.capacity_max)
      conditions.push({ field: 'capacity', op: '<=', value: Number(filters.capacity_max) });
    if (filters.floor)
      conditions.push({ field: 'floor', op: '=', value: filters.floor });

    return conditions.length ? { AND: conditions } : {};
  }, [filters]);

  const { data, isLoading, meta } = GetRooms({
    page,
    limit,
    filters: buildFilter(),
    select: JSON.stringify([
      'id',
      'room_number',
      'room_type',
      'status',
      'price_per_night',
      'capacity',
      'ref',
      'floor',
    ]),
  });

  const room: Room[] = data ?? [];

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
              Rooms
            </h5>
            <p className="f-12-500 text-muted mb-0">
              {meta?.total?.toLocaleString() ?? '—'} total records
            </p>
          </div>
          <button
            className="btn btn-sm f-12-600 px-3 py-2"
            style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8 }}
            onClick={() => setDrawerOpen(true)}>
            + New Room
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
                { label: 'Available', value: 'available' },
                { label: 'Reserved', value: 'reserved' },
              ]}
            />
            <FilterSelect
              label="Floor"
              value={filters.floor}
              onChange={(v) => {
                setFilters((f) => ({ ...f, floor: v }));
                setPage(1);
              }}
              options={[
                { label: 'Ground', value: '0' },
                { label: '1st', value: '1' },
                { label: '2nd', value: '2' },
              ]}
            />

            {/* Amount range */}
            <FilterAmountRange
              minVal={filters.price_min}
              maxVal={filters.price_max}
              label="Price/Night"
              onMinChange={(v) => {
                setFilters((f) => ({ ...f, price_min: v }));
                setPage(1);
              }}
              onMaxChange={(v) => {
                setFilters((f) => ({ ...f, price_max: v }));
                setPage(1);
              }}
            />
            <FilterAmountRange
              minVal={filters.capacity_min}
              maxVal={filters.capacity_max}
              label="Capacity"
              onMinChange={(v) => {
                setFilters((f) => ({ ...f, capacity_min: v }));
                setPage(1);
              }}
              onMaxChange={(v) => {
                setFilters((f) => ({ ...f, capacity_max: v }));
                setPage(1);
              }}
            />

            {/* Date range */}
          </FilterPanel>
        </div>
        {/* Table card */}
        <div
          className="bg-white rounded-3 general-border general-box-shadow"
          style={{ overflow: 'hidden' }}>
          <AppTable<Room>
            data={data}
            columns={columns}
            loading={isLoading}
            emptyText="No rooms found."
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

      <AddRoomDrawer
        open={drawerOpen}
        onClose={() => {
          setEditRoom(null);
          setDrawerOpen(false);
        }}
        room={editRoom}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditRoom(null)
          qc.invalidateQueries({ queryKey: ['rooms'] });
        }}
      />
    </>
  );
}
