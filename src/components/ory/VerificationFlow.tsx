// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import type { ComponentProps } from "react";
import { FlowType } from "@ory/client-fetch";
import type { OrySuccessHandler } from "@ory/elements-react";
import { toast } from "@/lib/toast";
import { AltchaVerification } from "./AltchaFlows";
import { oryComponentOverrides } from "./overrides";

const CODE_SENT_MESSAGE_ID = 1080003;

const handleSuccess: OrySuccessHandler = (event) => {
  if (
    event.flowType === FlowType.Verification &&
    event.flow.ui.messages?.some(({ id }) => id === CODE_SENT_MESSAGE_ID)
  ) {
    toast.success("A new verification code has been sent.");
  }
};

type Props = Pick<ComponentProps<typeof AltchaVerification>, "flow" | "config">;

const withSettingsAsRestartUrl = (flow: Props["flow"]): Props["flow"] =>
  flow.request_url?.includes("/self-service/registration/")
    ? { ...flow, request_url: "/user-settings" }
    : flow;

const VerificationFlow = ({ flow, config }: Props) => (
  <AltchaVerification
    flow={withSettingsAsRestartUrl(flow)}
    config={config}
    components={oryComponentOverrides}
    onSuccess={handleSuccess}
  />
);

export default VerificationFlow;
