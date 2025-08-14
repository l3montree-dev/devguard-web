// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// IF ERROR_TRACKING_DSN IS NOT SET, DO NOT INITIALIZE SENTRY
if (!process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN) {
  console.warn(
    "Sentry is not initialized because NEXT_PUBLIC_ERROR_TRACKING_DSN is not set.",
  );
} else {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
