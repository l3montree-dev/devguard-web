import { config as appConfig } from "@/config";
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

const discardBodyMethods = ["GET", "HEAD", "OPTIONS"];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // just forward the request to devguard
  // include the session cookie
  // check the url
  const url = new URL(req.url!, "http://localhost");
  url.pathname = url.pathname.replace("/api/devguard-tunnel", "");

  // get the path from the url
  const resp = await fetch(appConfig.devGuardApiUrl + url.pathname, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie as string,
    },
    credentials: "include",
    // TODO: Remove body parser to avoid parsing and stringifying afterwards
    body: discardBodyMethods.includes(req.method!)
      ? undefined
      : JSON.stringify(req.body),
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
