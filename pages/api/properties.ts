export default async function handler(req, res) {
    const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL

    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    switch (req.method) {
        case "POST":
            try {
                const { id } = req.query
                console.log(req.url, `${coreUrl}/v1/portfolio/listings/${id}`)
                const externalRes = await fetch(`${coreUrl}/v1/portfolio/properties/${id}/owners`, {
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
                    return res.status(externalRes.status).json({ message: externalData });
                }
                return res.status(200).json(externalData);
            } catch (error) {
                return res.status(500).json({ message: { message: 'Something went wrong' }, error });
            }
            break;
        case "PUT":
            try {
                const { id, ownerId } = req.query
                console.log(req.url, `${coreUrl}/v1/portfolio/listings/${id}`)
                const externalRes = await fetch(`${coreUrl}/v1/portfolio/properties/${id}/owners/${ownerId}`, {
                    method: 'PUT',
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
                return res.status(500).json({ message: { message: 'Something went wrong' }, error });
            }
            break;
        case "DELETE":
            try {
                const { id, owner_id } = req.query
                const externalRes = await fetch(`${coreUrl}/v1/portfolio/properties/${id}/owners/${owner_id}`, {
                    method: 'DELETE',
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
        case "PATCH":
            try {
                const { id } = req.query
                const externalRes = await fetch(`${coreUrl}/v1/portfolio/properties/${id}/status`, {
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
                return res.status(500).json(error);
            }
            break;

        default:
            break;
    }

}
