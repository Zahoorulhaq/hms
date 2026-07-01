// /pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing url" });
    }

    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
        res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 allow frontend
        res.send(Buffer.from(buffer));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch image" });
    }
}





