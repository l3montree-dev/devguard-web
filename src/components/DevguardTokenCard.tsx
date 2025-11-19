import React from "react";
import usePersonalAccessToken from "../hooks/usePersonalAccessToken";
import CopyCode from "./common/CopyCode";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { InputWithButton } from "./ui/input-with-button";

const DevguardTokenCard = () => {
  const { pat, onCreatePat } = usePersonalAccessToken();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new variable / secret</CardTitle>
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
