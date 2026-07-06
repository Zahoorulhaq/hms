// components/dashboard/OverView.tsx
'use client';

import { useState } from 'react';
import { startOfMonth } from 'date-fns';
import StatCard from './StatCard';
import ProfitSummary from './ProfitSummary';
import { MdAttachMoney, MdReceipt, MdHotel } from 'react-icons/md';
import { DateRange, useDashboardStats } from '@/hooks/useDashboardStats';
import DateRangeFilter from './DateRangeFilter';
import { GetPays } from '@/server/apis/bookings';
import { GetExpensesStats } from '@/server/apis/expenses';
import Link from 'next/link';

export default function OverView() {
  const [range, setRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const { data, isLoading, refetch } = GetPays({
    filters: {
      AND: [
        { field: 'created_at', op: '>=', value: range.from },
        { field: 'created_at', op: '<=', value: range.to },
      ],
    },
  });
  const {
    data: expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = GetExpensesStats({
    filters: {
      AND: [
        { field: 'created_at', op: '>=', value: range.from },
        { field: 'created_at', op: '<=', value: range.to },
      ],
    },
  });
  const { totalRevenue, totalExpenses, totalBookings, loading, error } = useDashboardStats(range);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header row */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
        <div>
          <h6 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>Overview</h6>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Financial summary for selected period
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.82rem' }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
        <Link href="/bookings" style={{ textDecoration: 'none' }}>
          <StatCard
            title="Total Revenue"
            loading={isLoading}
            value={data?.total_revenue ?? 0}
            subtitle="Payments received in period"
            icon={<MdAttachMoney size={24} />}
            trend="up"
            color="var(--primary)"
          />
        </Link>
        <Link href="/expenses" style={{ textDecoration: 'none' }}>
          <StatCard
            loading={expensesLoading}
            title="Total Expenses"
            value={expenses?.total_expenses ?? 0}
            subtitle="Expenses in period"
            icon={<MdReceipt size={24} />}
            trend="down"
            color="var(--danger)"
          />
        </Link>
        <ProfitSummary
          totalRevenue={data?.total_revenue || 0}
          totalExpenses={expenses?.total_expenses || 0}
        />
      </div>

      {/* Profit summary */}
    </div>
  );
}
