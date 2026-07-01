// Copyright 2026 L3montree GmbH.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type {
  SeeOncePatWithBearerToken,
  SeeOncePatWithPrivKey,
} from "@/types/api/api";
import type { FunctionComponent } from "react";
import Callout from "./common/Callout";
import CopyInput from "./common/CopyInput";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useConfig } from "../context/ConfigContext";
import CopyCode from "./common/CopyCode";
import useScannerImage from "../hooks/useScannerImage";

interface Props {
  token: SeeOncePatWithPrivKey | SeeOncePatWithBearerToken | null;
  open: boolean;
  onClose: () => void;
}

const isAsymmetric = (
  t: SeeOncePatWithPrivKey | SeeOncePatWithBearerToken,
): t is SeeOncePatWithPrivKey => "privKey" in t;

const NewTokenDialog: FunctionComponent<Props> = ({ token, open, onClose }) => {
  const config = useConfig();
  const latestScannerImage = useScannerImage();
  if (!token) return null;

  const asymmetric = isAsymmetric(token);
  const secret = asymmetric ? token.privKey : token.bearerToken;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personal Access Token Created</DialogTitle>
          <DialogDescription>
            Your new personal access token has been created successfully.
          </DialogDescription>
        </DialogHeader>

        <Callout intent="warning" showIcon>
          <p className="font-medium">Make sure to copy your token now!</p>
          <p className="mt-1">
            You won&apos;t be able to see it again. Store it securely as it
            provides access to your account.
          </p>
        </Callout>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Description</div>
            <p className="text-sm text-muted-foreground">
              {token.description || "No description"}
            </p>
          </div>

          <div>
            <div className="text-sm font-medium">Scopes</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {token.scopes
                .split(" ")
                .filter((s) => s.trim() !== "")
                .map((scope, index) => (
                  <Badge key={`${scope}-${index}`} variant="secondary">
                    {scope}
                  </Badge>
                ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">
              {asymmetric ? "Private key" : "Bearer token"}
            </div>
            <div className="mt-1">
              <CopyInput value={secret} />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Usage example</div>
            {asymmetric ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Pass the private key to the DevGuard Scanner CLI. The CLI
                  signs each request automatically — the key itself is never
                  transmitted.
                </p>
                <CopyCode
                  codeString={`docker run -v $PWD:/workspace ${latestScannerImage} devguard-scanner sca --token ${secret} --assetName="<INCLUDE YOUR ASSET NAME>" --path=/workspace --apiUrl=${config.devguardApiUrlPublicInternet}`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Send the token as a standard HTTP Authorization header. Use
                  this wherever your tooling does not support request signing.
                </p>
                <CopyCode
                  codeString={`curl -H "Authorization: Bearer ${secret}" ${config.devguardApiUrlPublicInternet}/api/v1/whoami`}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTokenDialog;
