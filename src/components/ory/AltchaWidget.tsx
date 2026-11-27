// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useEffect } from "react";
import type {} from "altcha/types/react";
import { ALTCHA_CHALLENGE_URL } from "@/const/altcha";
import { useConfig } from "@/context/ConfigContext";
import { useAltchaSolved } from "@/hooks/useAltchaSolved";

const WIDGET_CONFIGURATION = JSON.stringify({
  hideLogo: false,
  hideFooter: true,
});

const AltchaWidget = () => {
  const { altchaEnabled } = useConfig();
  const solved = useAltchaSolved();
  const visible = altchaEnabled && !solved;

  useEffect(() => {
    if (visible) {
      void import("altcha");
    }
  }, [visible]);

  return visible ? (
    <altcha-widget
      challenge={ALTCHA_CHALLENGE_URL}
      configuration={WIDGET_CONFIGURATION}
      auto="onload"
      className="mt-6 block"
    />
  ) : null;
};

export default AltchaWidget;
