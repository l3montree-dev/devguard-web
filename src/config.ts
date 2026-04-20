// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { parseHttpsUrl } from "./utils/url";

export const config = {
  devGuardApiUrl: process.env.DEVGUARD_API_URL,
  devguardApiUrlPublicInternet:
    process.env.DEVGUARD_API_URL_PUBLIC_INTERNET || "https://api.devguard.org",
  devguardScannerTag: "main-latest",
  retryInterval: 3000,
  privacyPolicyLink:
    process.env.PRIVACY_POLICY_LINK || "https://devguard.org/privacy-policy",
  termsOfUseLink:
    process.env.TERMS_OF_USE_LINK || "https://devguard.org/terms-of-use",
  theme: {
    jsUrl: parseHttpsUrl(process.env.THEME_JS_URL, "THEME_JS_URL"),
    jsIntegrity: process.env.THEME_JS_INTEGRITY || "",
    cssUrl: parseHttpsUrl(process.env.THEME_CSS_URL, "THEME_CSS_URL"),
  },
  analytics: {
    scriptUrl: parseHttpsUrl(
      process.env.ANALYTICS_SCRIPT_URL,
      "ANALYTICS_SCRIPT_URL",
    ),
    websiteId: process.env.ANALYTICS_WEBSITE_ID || "",
    integrity: process.env.ANALYTICS_SCRIPT_INTEGRITY || "",
  },
  imprintLink: process.env.IMPRINT_LINK || "https://devguard.org/imprint",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  accountDeletionMail:
    process.env.ACCOUNT_DELETION_MAIL || "community@devguard.org",
  devguardCIComponentBase:
    process.env.DEVGUARD_CI_COMPONENT_BASE ||
    "https://gitlab.com/l3montree/devguard/-/raw/main",
  devguardGithubAppUrl: process.env.DEVGUARD_API_URL_PUBLIC_INTERNET?.includes(
    "main.devguard.org",
  )
    ? "devguard-bot-dev"
    : "devguard-bot",
  enforceTheme: (process.env.ENFORCE_THEME || false) as
    | "white"
    | "dark"
    | false,
  errorTrackingDsn: process.env.ERROR_TRACKING_DSN || "",
  registrationEnabled: process.env.REGISTRATION_ENABLED !== "false",
  issueTrackerUrl:
    process.env.ISSUE_TRACKER_URL ||
    "https://github.com/l3montree-dev/devguard/issues/new/choose",
  billingUrl: process.env.BILLING_URL || "https://devguard.org",
};
