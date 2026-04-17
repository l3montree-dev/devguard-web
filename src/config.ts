// Copyright (C) 2023 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License

// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const parseHttpsUrl = (raw: string | undefined, varName: string): string => {
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") {
      throw new Error(`must use https (got ${u.protocol})`);
    }
    return u.toString();
  } catch (e) {
    console.warn(
      `[config] Ignoring ${varName}: ${(e as Error).message}. Expected absolute https URL.`,
    );
    return "";
  }
};

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
