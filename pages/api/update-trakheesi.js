export default async function handler(req, res) {
    const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL

    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    switch (req.method) {
        case "POST":
            try {
                const externalRes = await fetch(`${coreUrl}/v1/portfolio/listings/update-trakheesi-listing`, {
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

        default:
            break;
    }

}
