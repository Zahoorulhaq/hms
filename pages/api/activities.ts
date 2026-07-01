import { ACTIVE_URLS } from '@/utils/constants';
import { ACTIVITIES } from '@/server/endpoints';
import { get } from 'lodash';
import { createApiClient, handleApiResponse } from './_utils/fetchWithCookies';
export default async function handler(req, res) {
  const api = createApiClient(req);
  const coreUrl = ACTIVE_URLS.ACTIVE_CORE_URL;
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  switch (req.method) {
    case 'POST': {
      try {
        const { id, ...restFields } = req.body;
        const externalRes = await api(`${coreUrl}/${ACTIVITIES.BASE}`, {
          method: 'POST',
          body: restFields,
        });

        return handleApiResponse(externalRes, res);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error });
      }
    }
    case 'PUT': {
      try {
        const { id, ...restFields } = req.body;
        const externalRes = await api(`${coreUrl}/${ACTIVITIES.BASE}/${id}`, {
          method: 'PUT',
          body: restFields,
        });

        return handleApiResponse(externalRes, res);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error });
      }
    }
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
  return res.status(500).json({ message: 'Method does not exist' });
}
