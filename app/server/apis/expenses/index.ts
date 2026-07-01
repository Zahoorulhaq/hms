import { useQuery } from '@tanstack/react-query';
import { GET_REQUEST } from '@/server/https';
import { EXPENSES } from '@/server/endpoints';

export const GetExpensesStats = ({ filters }: { filters: any }) => {
  // Only send filter — no select, no group, no include
  const params = {
    filter: JSON.stringify(filters),
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [EXPENSES.STATS, params],  // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(EXPENSES.STATS, params);
      return data.data;
    },
    enabled: !!filters,  // don't run if filters not ready
  });

  return { isLoading, data, error, refetch };
};