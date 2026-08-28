// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InputWithButton } from "@/components/ui/input-with-button";
import useAccessToken from "@/hooks/useAccessToken";
import Link from "next/link";
import CopyCode from "./CopyCode";

interface ContentProps {
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
  repositoryProvider?: "github" | "gitlab";
}

export function EssentialProjectConfigContent({
  organizationSlug,
  projectSlug,
  assetSlug,
  repositoryProvider,
}: ContentProps) {
  const { accessToken: pat, onCreateAccessToken: onCreatePat } =
    useAccessToken();

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 pt-6">
        <div>
          <p className="text-sm font-semibold mb-2">Asset Name</p>
          <p className="text-sm text-muted-foreground mb-2">
            Use this as the{" "}
            <code className="font-mono text-xs">
              {repositoryProvider === "github"
                ? "asset-name"
                : "devguard_asset_name"}
            </code>{" "}
            config parameter when sending scan reports or SBOMs to DevGuard.
          </p>
          <CopyCode
            language="shell"
            codeString={`${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}`}
          />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Repository Access Token</p>
            <Link
              href={`/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/settings#access-tokens`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Manage existing tokens
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Used for API authentication. Set this as{" "}
            <code className="font-mono text-xs">DEVGUARD_TOKEN</code> in your
            CI/CD variables.
          </p>
          <InputWithButton
            label="Repository Access token"
            nameKey="devguard-secret-token"
            copyable={true}
            copyToastDescription="The DevGuard token has been copied to your clipboard."
            mutable={true}
            variant="onCard"
            value={pat?.privKey ?? "<REPOSITORY ACCESS TOKEN>"}
            update={{
              update: () =>
                onCreatePat({
                  scopes: "scan",
                  description: "DevGuard token with 'scan' scope",
                  expiryDateUnix:
                    Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
                }),
              updateConfirmTitle: "Create new repository access token",
              updateConfirmDescription:
                "Are you sure you want to create a new repository access token? Make sure to copy it, as you won't be able to see it again.",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
