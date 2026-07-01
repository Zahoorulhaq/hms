// components/dashboard/BookingsChart.tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useState }               from 'react';
import { MdExpandMore }           from 'react-icons/md';
import Dropdown, {
  DropdownItem, DropdownSection,
}                                 from '@/components/ui/Dropdown';

interface MonthData {
  month:    string;
  bookings: number;
  revenue:  number;
}

interface BookingsChartProps {
  data:    MonthData[];
  year:    number;
  setYear: (year: number) => void;
}

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2 p-3 general-border general-box-shadow">
      <div className="f-12-600 mb-2 text-main">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="f-12-500" style={{ color: p.color }}>
          {p.name}:{' '}
          <strong>
            {p.name === 'revenue' ? `Rs. ${p.value.toLocaleString()}` : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function BookingsChart({ data, year, setYear }: BookingsChartProps) {
  return (
    <div className="bg-white rounded-3 p-4 general-border general-box-shadow">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h6 className="fw-bold text-main mb-1">Monthly Bookings Overview</h6>
          <p className="f-12-500 text-muted mb-0">Bookings and revenue per month</p>
        </div>

        {/* Year selector dropdown */}
        <Dropdown
          trigger={
            <button className="btn btn-sm d-flex align-items-center gap-1 general-border rounded-2 f-12-600 text-main bg-white">
              {year}
              <MdExpandMore size={15} />
            </button>
          }
          align="right"
          minWidth={100}
        >
          {(close: () => void) => (
            <DropdownSection>
              {YEARS.map(y => (
                <DropdownItem
                  key={y}
                  active={y === year}
                  onClick={() => { setYear(y); close(); }}
                >
                  {y}
                </DropdownItem>
              ))}
            </DropdownSection>
          )}
        </Dropdown>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-color)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="bookings"
            orientation="left"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: 12 }}
            formatter={value => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <Bar
            yAxisId="bookings"
            dataKey="bookings"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            name="bookings"
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill="var(--primary-light)"
            radius={[4, 4, 0, 0]}
            name="revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}