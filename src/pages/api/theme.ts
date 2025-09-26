// Copyright 2025 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  console.log("Received request for theme:", req.method, req.url);

  switch (req.method) {
    case "POST":
      {
        const { url, type: contentType } = req.body;

        if (!url) {
          res.status(400).send("URL parameter is required");
          return;
        }

        console.log("Fetching theme from URL:", url);

        const resp = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": contentType || "text/plain",
          },
        })
          .then((r) => r.text())
          .catch((e) => {
            console.error("Error fetching theme from URL:", e);
            return "";
          });

        res.setHeader("Content-Type", contentType || "text/plain");
        res.status(200).send(resp);
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
