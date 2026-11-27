// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import type { ComponentType } from "react";
import type { OryClientConfiguration } from "@ory/elements-react";
import {
  Login,
  Recovery,
  Registration,
  Verification,
} from "@ory/elements-react/theme";
import { useAltchaConfig } from "@/hooks/useAltchaConfig";
import AltchaWidget from "./AltchaWidget";

const withAltcha = <P extends { config: OryClientConfiguration }>(
  Flow: ComponentType<P>,
) => {
  const AltchaFlow = (props: P) => {
    const config = useAltchaConfig(props.config);

    return (
      <>
        <Flow {...props} config={config} />
        <AltchaWidget />
      </>
    );
  };

  return AltchaFlow;
};

export const AltchaLogin = withAltcha(Login);
export const AltchaRegistration = withAltcha(Registration);
export const AltchaRecovery = withAltcha(Recovery);
export const AltchaVerification = withAltcha(Verification);
