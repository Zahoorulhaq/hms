import { useQuery } from '@tanstack/react-query';
import { GET_REQUEST, PATCH_REQUEST, POST_REQUEST } from '@/server/https';
import { ROOMS } from '@/server/endpoints';

export const GetRooms = ({
  filters,
  page,
  limit,
  select
}: {
  filters: any;
  page?: number;
  limit?: number;
  select?: string;
}) => {
  // Only send filter — no select, no group, no include
  const params = {
    filter: JSON.stringify(filters),
    limit: limit || 100,
    page: page || 1,
    select: select ||  JSON.stringify(['id', 'room_number', 'room_type', 'status']),
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [ROOMS.INDEX, params], // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(ROOMS.INDEX, params);
      return data.data;
    },
    enabled: !!filters, // don't run if filters not ready
  });

  return { isLoading, data: data?.data, meta: data?.meta, error, refetch };
};
export const AddRoom = async (roomData: any) => {
  const { data }: any = await POST_REQUEST(ROOMS.INDEX, roomData);
  return data.data;
};
export const EditRoom = async (roomData: any, id:number) => {
  const { data }: any = await PATCH_REQUEST(`${ROOMS.INDEX}/${id}`, roomData);
  return data.data;
};
