// components/dashboard/StatCard.tsx
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'var(--primary)',
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2 py-3 px-3 d-flex align-items-center gap-2 general-border general-box-shadow h-100">
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
        }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div className="f-12-500 text-muted mb-2">{title}</div>
        <div
          className={`f-24-700 ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-main'}`}>
         Rs. {value?.toLocaleString?.()}
        </div>
        {subtitle && <div className="f-12-500 fw-normal text-muted mt-1">{subtitle}</div>}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div
          className={`f-12-600 p-2 py-1 rounded-1 ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted'} ${trend === 'up' ? 'background-success' : trend === 'down' ? 'background-danger' : 'background-primary'}`}
         >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
        </div>
      )}
    </div>
  );
}
