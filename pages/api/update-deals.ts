export default async function handler(req, res) {
    const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL;
    const uri = 'v1/conversions/deals';
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    switch (req.method) {
        case 'PATCH':
            try {
                const { id } = req.body.payload;
                console.log('sent field',req.body.payload)
                const externalRes = await fetch(`${coreUrl}/${uri}/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: authorization,
                    },
                    body: JSON.stringify(req.body.payload),
                });

                const externalData = await externalRes.json();

                if (!externalRes.ok) {
                    return res.status(externalRes.status).json(externalData);
                }
                return res.status(200).json(externalData);
            } catch (error) {
                return res.status(500).json( {message: 'Something went wrong'  });
            }
            break;
       

        default:
            break;
    }
}