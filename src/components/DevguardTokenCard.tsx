// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useAccessToken from "../hooks/useAccessToken";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { InputWithButton } from "./ui/input-with-button";
import {
  innerCardClassName,
  innerInputVariant,
  type Surface,
} from "@/lib/surface";

const DevguardTokenCard = ({
  title = "Create a new variable / secret",
  variant,
  description = "Your pipeline uses this token to upload the scan results to DevGuard. Create a token, copy it and store it as a masked variable/ secret. It is only shown once.",
}: {
  title?: string;
  description?: string;
  // the surface the card is rendered on
  variant?: Surface;
}) => {
  const { accessToken: pat, onCreateAccessToken: onCreatePat } =
    useAccessToken();
  return (
    <Card className={innerCardClassName(variant)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <InputWithButton
            label="Name"
            value={`DEVGUARD_TOKEN`}
            copyable={true}
            copyToastDescription="The DevGuard token name has been copied to your clipboard."
            nameKey="devguard-token-name"
            variant={innerInputVariant(variant)}
          />
        </div>
        <div className="mb-2">
          <InputWithButton
            label="Secret token"
            nameKey="devguard-secret-token"
            variant={innerInputVariant(variant)}
            copyable={true}
            copyToastDescription="The DevGuard token has been copied to your clipboard."
            mutable={true}
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
