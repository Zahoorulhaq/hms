import { useQuery } from '@tanstack/react-query';
import { GET_REQUEST, POST_REQUEST } from '@/server/https';
import { ROOMS } from '@/server/endpoints';

export const GetRooms = ({ filters }: { filters: any }) => {
  // Only send filter — no select, no group, no include
  const params = {
    filter: JSON.stringify(filters),
    limit:100,
    select:['id','room_number','room_type','status']
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [ROOMS.INDEX, params],  // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(ROOMS.INDEX, params);
      return data.data;
    },
    enabled: !!filters,  // don't run if filters not ready
  });

  return { isLoading, data:data?.data, meta: data?.meta, error, refetch };
};