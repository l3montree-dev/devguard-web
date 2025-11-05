// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Use a placeholder DSN to satisfy type requirements see error-tracking.ts for actual forwarding
  dsn: "https://something@dummy.devguard.org/1",

  // Use the tunnel to avoid ad-blockers and respect privacy
  tunnel: "/api/error-tracking",

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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
