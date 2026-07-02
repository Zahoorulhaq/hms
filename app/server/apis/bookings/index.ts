import { useQuery } from '@tanstack/react-query';
import { GET_REQUEST, POST_REQUEST } from '@/server/https';
import { BOOKINGS } from '@/server/endpoints';

export const GetPays = ({ filters, sort }: { filters: any, sort?:any }) => {
  // Only send filter — no select, no group, no include
  const params = {
    filter: JSON.stringify(filters),
   
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [BOOKINGS.STATS, params],  // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(BOOKINGS.STATS, params);
      return data.data;
    },
    enabled: !!filters,  // don't run if filters not ready
  });

  return { isLoading, data, error, refetch };
};
export const GetBookings = ({ page, limit, filters, sort }: {page:number, limit:number, filters: any, sort?:any }) => {

  // Only send filter — no select, no group, no include
  const params = {
    filter: filters,
    page,
    limit,
    sort: JSON.stringify(sort || { created_at: 'desc' }),
    include: JSON.stringify([{
      name:'rooms',
      select:[]
    }]),
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [BOOKINGS.INDEX, params],  // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(BOOKINGS.INDEX, params);
      return data.data;
    },
    enabled: !!filters,  // don't run if filters not ready
  });

  return { isLoading, data, error, refetch };
};
export const BookingChart = (year: number = new Date().getFullYear()) => {
    const params = {
  filter: JSON.stringify({
    AND: [
      { field: 'created_at', op: 'year', value: year }, // current year
    ]
  }),
  
  group: JSON.stringify(['month']),  // group by month
};
  const { isLoading, data, error,refetch } = useQuery({
    queryKey: [BOOKINGS.CHART, params],
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(BOOKINGS.CHART, params);
      return data.data;
    },
  });

  return { isLoading, data, error,refetch };
};

export const AddBooking = async (bookingData: any) => {
  const { data }: any = await POST_REQUEST(BOOKINGS.INDEX, bookingData);
  return data.data;
};