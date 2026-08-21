// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useAccessToken from "../hooks/useAccessToken";
import CopyCode from "./common/CopyCode";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { InputWithButton } from "./ui/input-with-button";

const DevguardTokenCard = ({
  title = "Create a new variable / secret",
}: {
  title?: string;
}) => {
  const { accessToken: pat, onCreateAccessToken: onCreatePat } =
    useAccessToken();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="mb-2 block text-sm font-semibold">Name</span>
          <CopyCode language="shell" codeString={`DEVGUARD_TOKEN`} />
        </div>
        <div className="mb-2">
          <InputWithButton
            label="Secret token"
            nameKey="devguard-secret-token"
            copyable={true}
            copyToastDescription="The DevGuard token has been copied to your clipboard."
            mutable={true}
            variant="onCard"
            value={pat?.privKey ?? "<PERSONAL ACCESS TOKEN>"}
            update={{
              update: () =>
                onCreatePat({
                  scopes: "scan",
                  description: "DevGuard token with 'scan' scope",
                  expiryDateUnix:
                    Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
                }),
              updateConfirmTitle: "Create new personal access token",
              updateConfirmDescription:
                "Are you sure you want to create a new personal access token? Make sure to copy it, as you won't be able to see it again.",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DevguardTokenCard;
