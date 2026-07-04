// app/(dashboard)/users/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { GET_REQUEST, POST_REQUEST, PATCH_REQUEST, DELETE_REQUEST } from '@/server/https';
import AppTable from '@/components/ui/AppTable';
import Pagination from '@/components/ui/Pagination';
import FilterPanel from '@/components/ui/FiltersPanel';
import { FilterSelect } from '@/components/ui/FilterFields';
import type { PaginationMeta } from '@/components/ui/Pagination';
import { MdEdit, MdDelete, MdClose, MdPerson } from 'react-icons/md';
import { GetUsers } from '@/server/apis/users';
import { USERS } from '@/server/endpoints';
import { useUser } from '@/providers/UserProvider';
import Drawer from '@/components/ui/drawer/Drawer';
import DrawerFooter from '@/components/ui/drawer/DrawerFooter';
const USERS_KEY = USERS.INDEX;

// ── Types ─────────────────────────────────────────────────────────
interface User {
  id: number;
  ref: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  client?: { name: string };
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  is_active: boolean;
}

interface UserFilters {
  role: string;
  is_active: string;
}

const DEFAULT_FILTERS: UserFilters = { role: '', is_active: '' };

const ROLES = ['staff', 'manager', 'admin'];

// ── Helpers ───────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  superadmin: { bg: '#3e2008', color: '#fff' },
  admin: { bg: '#fff3e0', color: '#e65100' },
  manager: { bg: '#e8f5e9', color: '#2e7d32' },
  staff: { bg: '#e3f2fd', color: '#1565c0' },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_COLORS[role] ?? { bg: '#f5f5f5', color: '#666' };
  return (
    <span
      className="rounded-pill px-2 py-1 f-12-600 text-capitalize"
      style={{ background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {role}
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
export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const user = useUser();
  const activeCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  // Build filter
  const buildFilter = () => {
    const conditions: any[] = [{ field: 'id', op: '!=', value: user?.data?.id }]; // Exclude current user
    if (search.trim()) conditions.push({ field: 'name', op: '_like_', value: search.trim() });
    if (filters.role) conditions.push({ field: 'role', op: '=', value: filters.role });
    if (filters.is_active !== '')
      conditions.push({ field: 'is_active', op: '=', value: Number(filters.is_active) });
    return conditions.length ? { AND: conditions } : {};
  };

  const { data, isLoading, error, meta } = GetUsers({ filters: buildFilter(), page, limit });

  // ── Form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserForm>({
    defaultValues: { role: 'staff', is_active: true },
  });

  const isEdit = !!editUser;

  const openCreate = () => {
    setEditUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'staff',
      is_active: true,
    });
    setDrawerOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role,
      is_active: user.is_active,
    });
    setDrawerOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async (data: UserForm) => {
      if (isEdit && editUser) {
        const payload: any = { ...data };
        if (!payload.password) {
          delete payload.password;
          delete payload.password_confirmation;
        }
        const { data: res }: any = await PATCH_REQUEST(`${USERS_KEY}/${editUser.id}`, payload);
        return res;
      }
      const { data: res }: any = await POST_REQUEST(USERS_KEY, data);
      return res;
    },
    onSuccess: () => {
      reset();
      setDrawerOpen(false);
      setEditUser(null);
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data: res }: any = await DELETE_REQUEST(`${USERS_KEY}/${id}`);
      return res;
    },
    onSuccess: () => {
      setDeleteConfirm(null);
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });

  // ── Columns ──────────────────────────────────────────────────────
  const COLUMNS: ColumnDef<User, any>[] = useMemo(
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
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        cell: (i) => (
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}>
              {i.getValue()?.[0]?.toUpperCase()}
            </div>
            <span className="f-12-500" style={{ color: 'var(--text-main)' }}>
              {i.getValue()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableSorting: true,
        cell: (i) => <span className="f-12-500 text-muted">{i.getValue()}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        cell: (i) => <RoleBadge role={i.getValue()} />,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        enableSorting: false,
        cell: (i) => (
          <span
            className={`rounded-pill px-2 py-1 f-12-600 ${i.getValue() ? 'background-success text-success' : 'background-danger text-danger'}`}>
            {i.getValue() ? 'Active' : 'Inactive'}
          </span>
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
        cell: (i) => (
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => openEdit(i.row.original)}
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
              onClick={() => setDeleteConfirm(i.row.original)}
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

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
              Users
            </h5>
            <p className="f-12-500 text-muted mb-0">
              {meta?.total?.toLocaleString() ?? '—'} total users
            </p>
          </div>
          <button
            className="btn btn-sm f-12-600 px-3 py-2"
            style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8 }}
            onClick={openCreate}>
            + New User
          </button>
        </div>

        {/* Table card */}
        <div
          className="bg-white rounded-3 general-border general-box-shadow"
          style={{ overflow: 'hidden' }}>
          {/* Search + filters */}
          <div
            className="px-3 py-2 d-flex flex-column gap-2"
            style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <input
                type="text"
                className="form-control form-control-sm f-12-500"
                placeholder="Search name or email..."
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
              <FilterPanel
                onReset={() => {
                  setFilters(DEFAULT_FILTERS);
                  setPage(1);
                }}
                activeCount={activeCount}>
                <FilterSelect
                  label="Role"
                  value={filters.role}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, role: v }));
                    setPage(1);
                  }}
                  options={ROLES.map((r) => ({ label: r, value: r }))}
                />
                <FilterSelect
                  label="Status"
                  value={filters.is_active}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, is_active: v }));
                    setPage(1);
                  }}
                  options={[
                    { label: 'Active', value: '1' },
                    { label: 'Inactive', value: '0' },
                  ]}
                />
              </FilterPanel>
            </div>
          </div>

          <AppTable<User>
            data={data}
            columns={COLUMNS}
            loading={isLoading}
            emptyText="No users found."
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

      {/* ── User Drawer ──────────────────────────────────────────── */}
      {drawerOpen && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={isEdit ? `Edit — ${editUser?.name}` : 'New User'}
          subtitle={isEdit ? 'Update user details' : 'Add a new staff member'}
          width="clamp(320px, 40vw, 520px)"
          footer={
            <DrawerFooter
              onCancel={() => setDrawerOpen(false)}
              formId="user-form"
              submitLabel={mutation.isPending ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
              loading={mutation.isPending}
            />
          }>
          <form id="user-form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
            <Section title="Personal Details" />
            <div className="row g-3">
              <div className="col-12">
                <Field label="Full Name *" error={errors.name?.message}>
                  <input
                    className="form-control form-control-sm"
                    {...register('name', { required: 'Required' })}
                  />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Email *" error={errors.email?.message}>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    {...register('email', { required: 'Required' })}
                  />
                </Field>
              </div>
            </div>

            <Section title="Access" />
            <div className="row g-3">
              <div className="col-6">
                <Field label="Role *" error={errors.role?.message}>
                  <select
                    className="form-select form-select-sm"
                    {...register('role', { required: 'Required' })}>
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="text-capitalize">
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-6">
                <Field label="Status">
                  <select className="form-select form-select-sm" {...register('is_active')}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </Field>
              </div>
            </div>

            <Section title={isEdit ? 'Change Password (optional)' : 'Password'} />
            <div className="row g-3">
              <div className="col-12">
                <Field
                  label={isEdit ? 'New Password' : 'Password *'}
                  error={errors.password?.message}>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder={isEdit ? 'Leave blank to keep current' : ''}
                    {...register('password', {
                      required: isEdit ? false : 'Required',
                      minLength: { value: 8, message: 'Min 8 characters' },
                    })}
                  />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Confirm Password" error={errors.password_confirmation?.message}>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    {...register('password_confirmation', {
                      validate: (v) =>
                        !watch('password') || v === watch('password') || 'Passwords do not match',
                    })}
                  />
                </Field>
              </div>
            </div>

            {mutation.isError && (
              <div className="alert alert-danger f-12-500 py-2 mt-2">
                {(mutation.error as any)?.response?.data?.message ?? 'Something went wrong.'}
              </div>
            )}
          </form>
        </Drawer>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────── */}
      {deleteConfirm && (
        <>
          <div
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
              transform: 'translate(-50%,-50%)',
              background: '#fff',
              borderRadius: 12,
              padding: '28px 32px',
              width: 380,
              zIndex: 1070,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#ffebee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MdDelete size={18} color="var(--danger)" />
              </div>
              <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                Delete User
              </h6>
            </div>
            <p className="f-12-500 mb-4" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action
              cannot be undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm general-border f-12-600 text-muted px-3"
                style={{ borderRadius: 6 }}
                onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn btn-sm f-12-600 px-4"
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  opacity: deleteMutation.isPending ? 0.7 : 1,
                }}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </>
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
