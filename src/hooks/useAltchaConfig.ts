// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useMemo } from "react";
import type { OryClientConfiguration } from "@ory/elements-react";
import { altchaOryMiddleware } from "@/services/altchaOryMiddleware";

export const useAltchaConfig = (
  config: OryClientConfiguration,
): OryClientConfiguration =>
  useMemo(
    () => ({
      ...config,
      sdk: {
        ...config.sdk,
        options: {
          ...config.sdk?.options,
          middleware: [
            ...(config.sdk?.options?.middleware ?? []),
            altchaOryMiddleware,
          ],
        },
      },
    }),
    [config],
  );
