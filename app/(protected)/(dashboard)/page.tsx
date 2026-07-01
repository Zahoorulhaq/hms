// app/(dashboard)/page.tsx
'use client';

import { MdAttachMoney, MdReceipt, MdHotel } from 'react-icons/md';
import StatCard from '@/components/dashboard/StatCard';
import BookingsChart from '@/components/dashboard/BookingsChart';
import ProfitSummary from '@/components/dashboard/ProfitSummary';
import OverView from '@/components/dashboard/OverView';
import { BookingChart } from '@/server/apis/bookings';
import { useState } from 'react';

// 🔁 Replace with real API data later
const MOCK_STATS = {
  totalBookingRevenue: 485000,
  totalExpenses: 120000,
  totalBookings: 38,
};

const MOCK_CHART_DATA = [
  { month: 'Jan', bookings: 4, revenue: 32000 },
  { month: 'Feb', bookings: 6, revenue: 48000 },
  { month: 'Mar', bookings: 3, revenue: 24000 },
  { month: 'Apr', bookings: 8, revenue: 67000 },
  { month: 'May', bookings: 5, revenue: 41000 },
  { month: 'Jun', bookings: 12, revenue: 98000 },
  { month: 'Jul', bookings: 0, revenue: 0 },
];

export default function DashboardPage() {
  const { totalBookingRevenue, totalExpenses, totalBookings } = MOCK_STATS;
  const [year, setYear] = useState(new Date().getFullYear());
 const {
    data,
    isLoading,
    refetch,
  } = BookingChart(year);
  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        {/* <h5 style={{ fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Dashboard</h5>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Overview of your hotel performance
        </p> */}
      </div>
      <OverView />
      {/* Chart + Profit Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 16,
          alignItems: 'start',
        }}>
        <BookingsChart data={data??[]} year={year} setYear={setYear} />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          subtitle="All time bookings"
          icon={<MdHotel size={24} />}
          color="var(--primary-light)"
        />
      </div>
    </div>
  );
}
