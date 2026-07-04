// app/(dashboard)/expenses/page.tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { GET_REQUEST, POST_REQUEST } from '@/server/https';
import { EXPENSES } from '@/server/endpoints';
import AppTable from '@/components/ui/AppTable';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/ui/FiltersPanel';
import { FilterSelect, FilterAmountRange, FilterDateRange } from '@/components/ui/FilterFields';
import type { PaginationMeta } from '@/components/ui/Pagination';
import { MdClose, MdEdit } from 'react-icons/md';
import Drawer from '@/components/ui/drawer/Drawer';
import DrawerFooter from '@/components/ui/drawer/DrawerFooter';

// ── Types ─────────────────────────────────────────────────────────
interface Expense {
  id: number;
  ref: string;
  title: string;
  category: string;
  unit_amount: number;
  quantity: number;
  amount: number;
  expense_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

interface ExpenseForm {
  title: string;
  category: string;
  unit_amount: number;
  quantity: number;
  expense_date: string;
  payment_method: string;
  notes: string;
}

interface ExpenseFilters {
  category: string;
  payment_method: string;
  date_from: Date | null;
  date_to: Date | null;
  amount_min: string;
  amount_max: string;
}

const DEFAULT_FILTERS: ExpenseFilters = {
  category: '',
  payment_method: '',
  date_from: null,
  date_to: null,
  amount_min: '',
  amount_max: '',
};

const CATEGORIES = [
  'utilities',
  'salaries',
  'maintenance',
  'general',
  'food',
  'supplies',
  'marketing',
];

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'online'];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Columns ───────────────────────────────────────────────────────
const COLUMNS: ColumnDef<Expense, any>[] = [
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
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
    cell: (i) => (
      <span className="f-12-500" style={{ color: 'var(--text-main)' }}>
        {i.getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
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
    accessorKey: 'unit_amount',
    header: 'Unit Price',
    enableSorting: true,
    cell: (i) => (
      <span className="f-12-500 text-muted">Rs. {Number(i.getValue()).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
    enableSorting: false,
    cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
  },
  {
    accessorKey: 'amount',
    header: 'Total',
    enableSorting: true,
    cell: (i) => (
      <span className="f-12-600 text-danger">Rs. {Number(i.getValue()).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'expense_date',
    header: 'Date',
    enableSorting: true,
    cell: (i) => <span className="f-12-500 text-muted">{fmt(i.getValue())}</span>,
  },
  {
    accessorKey: 'payment_method',
    header: 'Method',
    enableSorting: false,
    cell: (i) => (
      <span className="f-12-500 text-capitalize text-muted">{i.getValue()?.replace('_', ' ')}</span>
    ),
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
    cell: () => (
      <button
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
    ),
  },
];

// ── Section + Field helpers (same as BookingDrawer) ───────────────
function Section({ title }: { title: string }) {
  return (
    <div className="mb-2 mt-3">
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

// ── Page ──────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '' && v !== null).length,
    [filters]
  );

  // Build filter
  const buildFilter = useCallback(() => {
    const conditions: any[] = [];
    if (search.trim()) conditions.push({ field: 'title', op: '_like_', value: search.trim() });
    if (filters.category) conditions.push({ field: 'category', op: '=', value: filters.category });
    if (filters.payment_method)
      conditions.push({ field: 'payment_method', op: '=', value: filters.payment_method });
    if (filters.date_from)
      conditions.push({
        field: 'created_at',
        op: '>=',
        value: format(filters.date_from, 'yyyy-MM-dd'),
      });
    if (filters.date_to)
      conditions.push({
        field: 'created_at',
        op: '<=',
        value: format(filters.date_to, 'yyyy-MM-dd'),
      });
    if (filters.amount_min)
      conditions.push({ field: 'amount', op: '>=', value: Number(filters.amount_min) });
    if (filters.amount_max)
      conditions.push({ field: 'amount', op: '<=', value: Number(filters.amount_max) });
    return conditions.length ? JSON.stringify({ AND: conditions }) : undefined;
  }, [search, filters]);

  const params = useMemo(
    () => ({
      filter: buildFilter(),
      sort: JSON.stringify({ created_at: 'desc' }),
      page,
      limit,
    }),
    [buildFilter, page, limit]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(EXPENSES.INDEX, params);
      return data.data;
    },
    placeholderData: (prev: any) => prev,
  });

  const expenses: Expense[] = data?.data ?? [];
  const meta: PaginationMeta = data?.meta;

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  };

  // Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseForm>({
    defaultValues: { quantity: 1, unit_amount: 0, payment_method: 'cash' },
  });

  const unitAmount = watch('unit_amount') || 0;
  const quantity = watch('quantity') || 1;
  const total = Number(unitAmount) * Number(quantity);

  const mutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      const { data: res }: any = await POST_REQUEST(EXPENSES.INDEX, {
        ...data,
        amount: total,
      });
      return res;
    },
    onSuccess: () => {
      reset();
      setDrawerOpen(false);
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
              Expenses
            </h5>
            <p className="f-12-500 text-muted mb-0">
              {meta?.total?.toLocaleString() ?? '—'} total records
            </p>
          </div>
          <button
            className="btn btn-sm f-12-600 px-3 py-2"
            style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8 }}
            onClick={() => setDrawerOpen(true)}>
            + New Expense
          </button>
        </div>

        {/* Table card */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control f-12-500"
            placeholder="Search title..."
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
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(v) => {
                setFilters((f) => ({ ...f, category: v }));
                setPage(1);
              }}
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
            <FilterSelect
              label="Payment Method"
              value={filters.payment_method}
              onChange={(v) => {
                setFilters((f) => ({ ...f, payment_method: v }));
                setPage(1);
              }}
              options={PAYMENT_METHODS.map((m) => ({
                label: m.replace('_', ' '),
                value: m,
              }))}
            />
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
        <div
          className="bg-white rounded-3 general-border general-box-shadow"
          style={{ overflow: 'hidden' }}>
          <AppTable<Expense>
            data={expenses}
            columns={COLUMNS}
            loading={isLoading}
            emptyText="No expenses found."
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

      {/* ── Add Expense Drawer ──────────────────────────────────── */}
      {drawerOpen && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="New Expense"
          subtitle="Record a new expense"
          width="clamp(320px, 40vw, 520px)"
          footer={
            <DrawerFooter
              onCancel={() => setDrawerOpen(false)}
              formId="expense-form"
              submitLabel={mutation.isPending ? 'Saving…' : 'Save Expense'}
              loading={mutation.isPending}
            />
          }>
          <form id="expense-form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
            <Section title="Expense Details" />
            <div className="row g-3">
              <div className="col-12">
                <Field label="Title *" error={errors.title?.message}>
                  <input
                    className="form-control form-control"
                    placeholder="e.g. Electricity Bill"
                    {...register('title', { required: 'Required' })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Category *" error={errors.category?.message}>
                  <select
                    className="form-select form-select"
                    {...register('category', { required: 'Required' })}>
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-6">
                <Field label="Date *" error={errors.expense_date?.message}>
                  <input
                    type="date"
                    className="form-control form-control"
                    {...register('expense_date', { required: 'Required' })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Payment Method">
                  <select className="form-select form-select" {...register('payment_method')}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m} className="text-capitalize">
                        {m.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <Section title="Amount" />
            <div className="row g-3">
              <div className="col-6">
                <Field label="Unit Price (Rs.) *" error={errors.unit_amount?.message}>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control form-control"
                    {...register('unit_amount', {
                      required: 'Required',
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="Quantity *" error={errors.quantity?.message}>
                  <input
                    type="number"
                    min={1}
                    className="form-control form-control"
                    {...register('quantity', {
                      required: 'Required',
                      valueAsNumber: true,
                      min: 1,
                    })}
                  />
                </Field>
              </div>

              {/* Live total preview */}
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center px-3 py-2 rounded-2"
                  style={{
                    background: 'var(--primary-bg)',
                    border: '1px solid var(--border-color)',
                  }}>
                  <span className="f-12-600 text-muted">Total Amount</span>
                  <span className="f-24-700 text-danger">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Section title="Notes" />
            <Field label="Notes">
              <textarea className="form-control form-control" rows={3} {...register('notes')} />
            </Field>

            {mutation.isError && (
              <div className="alert alert-danger f-12-500 py-2">
                {(mutation.error as any)?.message ?? 'Something went wrong.'}
              </div>
            )}
          </form>
        </Drawer>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
