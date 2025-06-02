import { config as appConfig } from "@/config";
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    req.on("data", (chunk: Uint8Array) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
};

const discardBodyMethods = ["GET", "HEAD", "OPTIONS"];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // just forward the request to devguard
  // include the session cookie
  // check the url
  const url = new URL(req.url!, appConfig.devGuardApiUrl);

  url.pathname = url.pathname.replace("/api/devguard-tunnel", "");

  const bytes = await buffer(req);
  // get the path from the url
  const { connection, origin, host, ...rest } = req.headers;

  const resp = await fetch(url, {
    method: req.method,
    headers: {
      ...(rest as Record<string, string>),
      Cookie: req.headers.cookie as string,
    },
    credentials: "include",
    redirect: "manual",
    // TODO: Remove body parser to avoid parsing and stringifying afterwards
    body: discardBodyMethods.includes(req.method!) ? undefined : bytes,
  });

  console.log(resp);
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

  res.flushHeaders();

  // enables streaming support
  // @ts-expect-error
  const nodeStream = Readable.fromWeb(resp.body);

  nodeStream.on("data", (chunk) => {
    res.write(chunk); // Write chunk to the response
    // @ts-expect-error
    if (typeof res.flush === "function") {
      // @ts-expect-error
      res.flush(); // Flush each chunk if `flush` is available
    }
  });

  nodeStream.on("end", () => res.end());
}
