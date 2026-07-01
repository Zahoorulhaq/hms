import { NOTES } from '@/server/endpoints';
import { ACTIVE_URLS } from '@/utils/constants';

export default async function handler(req, res) {
  const { authorization } = req.headers;
  const coreUrl = ACTIVE_URLS.ACTIVE_CORE_URL;
  switch (req.method) {
    case 'PATCH':
      try {
        const externalRes = await fetch(`${coreUrl}/v1/storage/media/archive`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify(req.body),
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        }
        return res.status(200).json(externalData);
      } catch (error) {
        return res.status(500).json({ message: error });
      }
      break;
    case 'PUT':
      try {
        const externalRes = await fetch(`${coreUrl}/v1/storage/media/restore`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify(req.body),
        });

        const externalData = await externalRes.json();

        if (!externalRes.ok) {
          return res.status(externalRes.status).json({ message: externalData });
        }
        return res.status(200).json(externalData);
      } catch (error) {
        return res.status(500).json({ message: error });
      }
      break;
  }
}
