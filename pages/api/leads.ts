import { CORE_LEADS } from '@/server/endpoints';
import { createApiClient, handleApiResponse } from './_utils/fetchWithCookies';

export default async function handler(req, res) {
  const api = createApiClient(req);

  switch (req.method) {
    case 'POST': {
      try {
        const externalRes = await api(CORE_LEADS.BASE, {
          method: 'POST',
          body: req.body,
        });

        return handleApiResponse(externalRes, res);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error });
      }
    }

    case 'PUT': {
      try {
        const { id, ...restFields } = req.body;
        const externalRes = await api(`${CORE_LEADS.BASE}/${id}`, {
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
}
