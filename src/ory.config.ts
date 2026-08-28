// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { OryClientConfiguration } from "@ory/elements-react";

const config: OryClientConfiguration = {
  sdk: {
    url: process.env.ORY_SDK_PUBLIC_URL ?? "",
  },
  intl: {
    locale: "en",
  },
  project: {
    default_redirect_url: "/",
    error_ui_url: "/error",
    name: "devguard-web",
    registration_enabled: process.env.REGISTRATION_ENABLED !== "false",
    verification_enabled: true,
    recovery_enabled: true,
    registration_ui_url: "/registration",
    verification_ui_url: "/verification",
    recovery_ui_url: "/recovery",
    login_ui_url: "/login",
    settings_ui_url: "/user-settings",
  },
};

export default config;
