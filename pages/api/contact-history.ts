import { CONTACT_HISTORY, } from "@/server/endpoints";
import { ACTIVE_URLS } from "@/utils/constants";
import { omit } from "lodash";

export default async function handler(req, res) {
  const coreUrl = ACTIVE_URLS.ACTIVE_CORE_URL;
  switch (req.method) {
    case "POST": {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ message: "Authorization token missing" });
      }
      try {
        const externalRes = await fetch(`${coreUrl}/${CONTACT_HISTORY.POST}`, {
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
    case "PATCH": {
      const { authorization } = req.headers;
      if (!authorization) {
        return res.status(401).json({ message: "Authorization token missing" });
      }
      try {
        const { id, ...restFields } = omit(req.body)
        const externalRes = await fetch(`${coreUrl}/${CONTACT_HISTORY.POST}/${id}?include=[{'name':"customer"}]`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authorization,
          },
          body: JSON.stringify(restFields),
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
  return res.status(500).message("Method does not exists");
}
