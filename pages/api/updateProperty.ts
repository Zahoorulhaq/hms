import { createApiClient, handleApiResponse } from './_utils/fetchWithCookies';
export default async function handler(req, res) {
  const api = createApiClient(req);
  const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  switch (req.method) {
    case 'PUT':
      try {
        const { id } = req.query;

        const externalRes = await api(`${coreUrl}/v1/portfolio/properties/${id}`, {
          method: 'PUT',
          body: req.body,
        });

        return handleApiResponse(externalRes, res);
      } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
      }
    default:
      break;
  }
}
