import { OryClientConfiguration } from "@ory/elements-react";
import { Settings } from "@ory/elements-react/theme";
import { SettingsFlow } from "@ory/client-fetch";
import React, { useMemo } from "react";
import { oryComponentOverrides } from "./ory/overrides";
import { rewriteFlow } from "../types/auth";

interface Props {
  flow: SettingsFlow;
  config: OryClientConfiguration;
}

const UserSettings = ({ flow, config }: Props) => {
  const rewrittenFlow = useMemo(() => {
    return rewriteFlow(flow);
  }, [flow]);

  return (
    <Settings
      config={config}
      flow={rewrittenFlow}
      components={oryComponentOverrides}
    />
  );
};

export default UserSettings;
