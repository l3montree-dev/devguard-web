import type { NextApiRequest, NextApiResponse } from "next";
import { config } from "../../config";

const getSentryConfig = () => {
  const dsn = config.errorTrackingDsn;

  if (!dsn) {
    return null;
  }

  try {
    const dsnUrl = new URL(dsn);
    const host = dsnUrl.hostname;
    const projectId = dsnUrl.pathname?.replace(/^\//, "");
    // Fformat: https://<public_key>@<host>/<project_id>
    const publicKey = dsnUrl.username;

    return { host, projectId, publicKey };
  } catch (e) {
    console.error("Invalid Sentry DSN format", e);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sentryConfig = getSentryConfig();

  // if error tracking is disabled (not configured), return success without forwarding
  if (!sentryConfig) {
    return res.status(200).json({});
  }

  try {
    const upstreamSentryUrl = `https://${sentryConfig.host}/api/${sentryConfig.projectId}/envelope/?sentry_version=9&sentry_key=${sentryConfig.publicKey}&sentry_client=sentry.javascript.nextjs%2F9.34.0`;

    const response = await fetch(upstreamSentryUrl, {
      method: "POST",
      body: req.body,
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
    });

    if (!response.ok) {
      throw new Error(`Sentry upstream returned ${response.status}`);
    }

    console.log("[INFO] Forwarded error event");

    return res.status(200).json({});
  } catch (e) {
    console.error("Error tunneling to Sentry", e);
    return res.status(500).json({ error: "Error tunneling to Sentry" });
  }
}
