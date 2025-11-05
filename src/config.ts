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

import React from "react";

// along with this program.  If not, see <http://www.gnu.org/licenses/>.
export const config = {
  devGuardApiUrl: process.env.DEVGUARD_API_URL,
  oryKratosUrl: process.env.ORY_KRATOS_URL,
  devguardApiUrlPublicInternet:
    process.env.DEVGUARD_API_URL_PUBLIC_INTERNET || "https://api.devguard.org",
  devguardScannerTag: "main-latest",
  retryInterval: 3000,
  oidcOnly: process.env.OIDC_ONLY === "true" || false,
  privacyPolicyLink:
    process.env.PRIVACY_POLICY_LINK || "https://devguard.org/privacy-policy",
  termsOfUseLink:
    process.env.TERMS_OF_USE_LINK || "https://devguard.org/terms-of-use",
  themeJsUrl: process.env.THEME_JS_URL || "",
  themeCssUrl: process.env.THEME_CSS_URL || "",
  imprintLink: process.env.IMPRINT_LINK || "https://devguard.org/imprint",
  frontendUrl: process.env.FRONTEND_URL || "https://app.devguard.org",
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
};
