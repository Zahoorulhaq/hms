import { useQuery } from '@tanstack/react-query';
import { DELETE_REQUEST, GET_REQUEST, PATCH_REQUEST, POST_REQUEST } from '@/server/https';
import { USERS } from '@/server/endpoints';

export const GetUsers = ({
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
    select: select ||  JSON.stringify([]),
  };

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [USERS.INDEX, params], // use filters not params as key
    queryFn: async () => {
      const { data }: any = await GET_REQUEST(USERS.INDEX, params);
      return data.data;
    },
    enabled: !!filters, // don't run if filters not ready
  });

  return { isLoading, data: data?.data, meta: data?.meta, error, refetch };
};
export const AddUser = async (userData: any) => {
  const { data }: any = await POST_REQUEST(USERS.INDEX, userData);
  return data.data;
};
export const EditUser = async (userData: any, id:number) => {
  const { data }: any = await PATCH_REQUEST(`${USERS.INDEX}/${id}`, userData);
  return data.data;
};
export const DeleteUser = async (id:number) => {
  const { data }: any = await DELETE_REQUEST(`${USERS.DELETE}/${id}`);
  return data.data;
}
