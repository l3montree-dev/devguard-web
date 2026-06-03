// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { InputWithButton } from "@/components/ui/input-with-button";
import usePersonalAccessToken from "@/hooks/usePersonalAccessToken";
import Link from "next/link";
import CopyCode from "./CopyCode";

interface ContentProps {
  organizationSlug: string;
  projectSlug: string;
  assetSlug: string;
  repositoryProvider?: string;
}

export function EssentialProjectConfigContent({
  organizationSlug,
  projectSlug,
  assetSlug,
  repositoryProvider,
}: ContentProps) {
  const { pat, onCreatePat } = usePersonalAccessToken();

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
            <p className="text-sm font-semibold">Personal Access Token</p>
            <Link
              href="/user-settings#pat"
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
            label="Personal Access token"
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
}

export function EssentialProjectConfigDrawer(props: ContentProps) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Go to Essential Project Settings</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>Essential Project Config</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4 mt-4">
          <EssentialProjectConfigContent {...props} />
        </div>
        <div className="p-4 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
