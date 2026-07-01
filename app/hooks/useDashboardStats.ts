// hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
// import { apiQuery }            from '@/lib/apiClient';
import { format }              from 'date-fns';

export interface DateRange {
  from: Date;
  to:   Date;
}

export interface DashboardStats {
  totalRevenue:  number;
  totalExpenses: number;
  totalBookings: number;
  loading:       boolean;
  error:         string | null;
}

export function useDashboardStats(range: DateRange): DashboardStats {
  const [stats,   setStats]   = useState({ totalRevenue: 0, totalExpenses: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);



  return { ...stats, loading, error };
}