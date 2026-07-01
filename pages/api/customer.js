export default async function handler(req, res) {
    const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL;

    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    switch (req.method) {
        case 'POST':
            try {
                const externalRes = await fetch(`${coreUrl}/v1/people/customers`, {
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
                return res.status(500).json({ message: 'Something went wrong', data: error });
            }
            break;
        case 'PATCH':
            try {
                const { id } = req.query;
                const externalRes = await fetch(`${coreUrl}/v1/people/customers/${id}/dncr`, {
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
                    return res.status(externalRes.status).json(externalData);
                }
                return res.status(200).json(externalData);
            } catch (error) {
                return res.status(500).json({ message: 'Something went wrong', data: error });
            }
            break;
        case 'PUT':
            try {
                const { id, ...restBody } = req.body;
                const externalRes = await fetch(`${coreUrl}/v1/people/customers/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: authorization,
                    },
                    body: JSON.stringify(restBody),
                });
                const externalData = await externalRes.json();
                if (!externalRes.ok) {
                    return res.status(externalRes.status).json(externalData);
                }
                return res.status(200).json(externalData);
            } catch (error) {
                return res.status(500).json({ message: { message: 'Something went wrong' }, error });
            }
            break;

        default:
            break;
    }
}