// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Link from "next/link";
import { useState } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import useAccessToken from "../hooks/useAccessToken";
import { DatePicker } from "./DatePicker";
import CopyCode from "./common/CopyCode";
import Section from "./common/Section";
import { Button } from "./ui/button";

const AccessTokenSection = ({ description }: { description: string }) => {
  const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const { accessToken: pat, onCreateAccessToken: onCreatePat } =
    useAccessToken();

  const manageTokensHref = `/${org.slug}/projects/${project.slug}/assets/${asset.slug}/settings#access-tokens`;

  return (
    <Section
      className="mb-0 mt-0 pb-0 pt-0"
      description="To use the Devguard-Scanner, you need to create a Repository Access Token. You can create such a token by clicking the button below. It will be added automatically to the CLI command below and is necessary."
      title="Create a Repository Access Token"
      forceVertical
    >
      {pat ? (
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex flex-row gap-2">
              <CopyCode language="shell" codeString={pat.privKey} />
            </div>
            <span className="block text-right text-sm text-destructive">
              Make sure to copy the token. You won&apos;t be able to see it ever
              again!
            </span>
            <Link
              href={manageTokensHref}
              target="_blank"
              className="mt-4 items-end justify-end flex text-sm"
            >
              <span>Create a new token or manage your existing ones</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 justify-between items-start">
            <Button
              variant="outline"
              onClick={() =>
                onCreatePat({
                  description,
                  scopes: "scan",
                  expiryDateUnix:
                    Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS,
                })
              }
            >
              Create Repository Access Token
            </Button>
            <Link
              href={manageTokensHref}
              target="_blank"
              className="flex items-end justify-end align-super text-sm"
            >
              <span>Manage your tokens</span>
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
};

export default AccessTokenSection;
