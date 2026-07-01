import { ACTIVE_URLS } from "@/utils/constants";
import { get, } from "lodash";

export default async function handler(req, res) {
    const coreUrl = ACTIVE_URLS.ACTIVE_CORE_URL;
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    switch (req.method) {

        case "PATCH": {
            try {
                const url = `${coreUrl}/v1/portfolio/properties/${get(req, 'body.id')}/amenities`;
                const externalRes = await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: authorization,
                    },
                    body: JSON.stringify({ amenities: req.body.amenities })
                });

                const externalData = await externalRes.json();

                if (!externalRes.ok) {
                    return res.status(externalRes.status).json( externalData );
                }
                return res.status(200).json(externalData);
            } catch (error) {
                return res
                    .status(500)
                    .json({message: "Something went wrong", data:error} );
            }
        }
    }
    return res.status(500).json("Method does not exists");
}
