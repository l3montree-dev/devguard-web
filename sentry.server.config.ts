// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { config } from "./src/config";

if (!config.errorTrackingDsn) {
  console.warn(
    "Sentry is not initialized because ERROR_TRACKING_DSN is not set.",
  );
} else {
  Sentry.init({
    dsn: config.errorTrackingDsn,

    debug: false,

    release: process.env.NEXT_PUBLIC_VERSION,

    beforeSend(event) {
      if (event.request && event.request.cookies) {
        delete event.request.cookies;
      }
      if (event.request && event.request.headers) {
        delete event.request.headers.cookie;
      }
      // remove user ip from event
      if (event.user && event.user.ip_address) {
        delete event.user.ip_address;
      }
      return event;
    },

    sendDefaultPii: false,
  });
}
