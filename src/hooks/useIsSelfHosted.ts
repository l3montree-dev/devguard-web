// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useConfig } from "@/context/ConfigContext";

const HOSTED_INSTANCES = ["app.devguard.org", "devguard.opencode.de"];

export const useIsSelfHosted = () => {
  const { frontendUrl } = useConfig();
  const hostname = URL.parse(frontendUrl)?.hostname ?? "";
  return !HOSTED_INSTANCES.includes(hostname);
};
