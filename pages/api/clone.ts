export default async function handler(req, res) {
  const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL;

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  switch (req.method) {
    case 'POST':
      try {
        const { id } = req.query;
        const externalRes = await fetch(`${coreUrl}/v1/portfolio/listings/${id}/clone`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify(req.body),
        });

        const externalData = await externalRes.json();
        if (!externalRes.ok) {
          return res.status(externalRes.status).json(externalData);
        }
        return res.status(200).json(externalData);
      } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return res.status(500).json({ message: error });
      }
      break;
    default:
      break;
  }
}
