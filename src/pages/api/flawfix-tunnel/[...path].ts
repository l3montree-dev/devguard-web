import { config as appConfig } from "@/config";
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // just forward the request to flawfix
  // include the session cookie
  // check the url
  const url = new URL(req.url!, "http://localhost");
  url.pathname = url.pathname.replace("/api/flawfix-tunnel", "");

  // get the path from the url
  const resp = await fetch(appConfig.flawFixApiUrl + url.pathname, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie as string,
    },
    credentials: "include",
    // TODO: Remove body parser to avoid parsing and stringifying afterwards
    body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
  });

  // set all headers and copy the status code
  res.status(resp.status);
  resp.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (resp.body === null) {
    // no content
    res.end();
    return;
  }
  // pipe the response
  // @ts-expect-error resp.body is a ReadableStream
  Readable.fromWeb(resp.body).pipe(res);
}
