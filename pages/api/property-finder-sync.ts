import { COREPROPERTIES } from "@/server/endpoints";
import { ACTIVE_URLS } from "@/utils/constants";
import { get, omit } from "lodash";

export default async function handler(req, res) {
  const coreUrl = ACTIVE_URLS.ACTIVE_CORE_URL;
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  switch (req.method) {
    case "POST": {
      try {
        const externalRes = await fetch(`${coreUrl}/v1/portfolio/listings/pf/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
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
        return res
          .status(500)
          .json({ message: { message: "Something went wrong" }, error });
      }
    }
  }
  return res.status(500).json("Method does not exists");
}
