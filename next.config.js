// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

const isDev = process.env.NODE_ENV !== "production";

// Extract the scheme+host (origin) of a configured URL so it can be added to
// a CSP allow-list. Returns null for unset/invalid values.
const toOrigin = (url) => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

// External origins are runtime-configured via env vars
const themeJsOrigin = toOrigin(process.env.THEME_JS_URL);
const themeCssOrigin = toOrigin(process.env.THEME_CSS_URL);
const analyticsOrigin = toOrigin(process.env.ANALYTICS_SCRIPT_URL);
const publicApiOrigin = toOrigin(process.env.DEVGUARD_API_URL_PUBLIC_INTERNET);
// Ory self-service calls (connect-src) and flow form POSTs (form-action) are
// same-origin only while ORY_SDK_PUBLIC_URL points at this frontend. Deriving
// its origin here keeps the CSP correct even if it is pointed elsewhere.
const oryOrigin = toOrigin(process.env.ORY_SDK_PUBLIC_URL);

const buildCsp = () => {
  const directives = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'", oryOrigin],
    // 'unsafe-inline' is required because Next.js injects inline hydration scripts
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'wasm-unsafe-eval'",
      isDev && "'unsafe-eval'",
      themeJsOrigin,
      analyticsOrigin,
    ],
    // Radix, Tailwind and next-themes apply inline styles at runtime.
    "style-src": ["'self'", "'unsafe-inline'", themeCssOrigin],
    // Avatars/logos are served from arbitrary git-provider hosts.
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    // Most API/Sentry/Ory traffic is proxied same-origin. Direct browser calls:
    // - blob: — Three.js/GLTF lanyard fetches its bundled model + textures.
    // - api.github.com — client-side version check (admin instance info).
    // - raw.githubusercontent.com — docs drawers fetch MDX at runtime.
    "connect-src": [
      "'self'",
      "blob:",
      "https://api.github.com",
      "https://raw.githubusercontent.com",
      isDev && "ws:",
      analyticsOrigin,
      publicApiOrigin,
      oryOrigin,
    ],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "frame-src": ["'self'"],
  };

  const parts = Object.entries(directives).map(
    ([name, values]) => `${name} ${values.filter(Boolean).join(" ")}`,
  );
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
};

// Without the public API origin the CSP's connect-src would block API calls and
// break the app, so we drop the CSP header entirely (rather than ship a broken
// one) while still sending the other hardening headers.
if (!publicApiOrigin) {
  console.warn(
    "[security-headers] DEVGUARD_API_URL_PUBLIC_INTERNET is not set — omitting Content-Security-Policy header (other security headers still applied)",
  );
}

const securityHeaders = [
  ...(publicApiOrigin
    ? [{ key: "Content-Security-Policy", value: buildCsp() }]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS is only meaningful (and only honoured) over HTTPS
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

// Set SET_SECURITY_HEADERS=false to drop every
// header below, e.g. when a reverse proxy already owns them.
const securityHeadersEnabled = process.env.SET_SECURITY_HEADERS !== "false";

if (securityHeadersEnabled) {
  console.log(
    "[security-headers] enabled — applying hardening headers to all routes",
  );
  const csp = securityHeaders.find(
    (h) => h.key === "Content-Security-Policy",
  );
  if (csp) {
    console.log("[security-headers] Content-Security-Policy: " + csp.value);
  }
} else {
  console.log(
    "[security-headers] disabled via SET_SECURITY_HEADERS=false — no security headers will be sent",
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    if (!securityHeadersEnabled) return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  generateBuildId: async () => process.env.GIT_COMMIT_SHA ?? "dev",
  turbopack: {
    resolveAlias: {
      istextorbinary: "./src/lib/istextorbinary-wrapper.js",
    },
  },
  experimental: {
    turbopackModuleIds: "deterministic",
    turbopackFileSystemCacheForDev: true,
    useCache: true,
  },
  cacheComponents: true,
  output: "standalone",
};

module.exports = nextConfig;

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "devguard",
  project: "devguard-web",
  sentryUrl: "https://error-tracking.devguard.org/",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  // disabled: causes excessive memory usage during webpack compilation in CI
  widenClientFileUpload: false,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

});
