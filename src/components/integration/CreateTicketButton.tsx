// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Renders nothing unless a ticket can actually be created — that needs a linked

import type { ExternalTicketProvider } from "@/types/common";
import type { FunctionComponent } from "react";
import { AsyncButton, Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ProviderIcon } from "./ProviderIcon";

// issue tracker and a vulnerability that doesn't have a ticket yet.
export const CreateTicketButton: FunctionComponent<{
  integrationName: ExternalTicketProvider | undefined;
  hasTicket: boolean;
  externalEntityProviderId?: string;
  orgSlug: string;
  projectSlug: string;
  assetSlug: string;
  onClick: () => Promise<any>;
}> = ({
  integrationName,
  hasTicket,
  externalEntityProviderId,
  orgSlug,
  projectSlug,
  assetSlug,
  onClick,
}) => {
  if (hasTicket) return null;

  if (integrationName === undefined) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button variant={"ghost"} disabled className="">
              <span className="ml-1 text-muted-foreground">Create Ticket</span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          No repository is linked. To create a ticket, please integrate your
          issue tracker in the {` `}
          <Link
            href={`/${orgSlug}/projects/${projectSlug}/assets/${assetSlug}/settings/repository`}
            className="underline"
          >
            settings
          </Link>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <AsyncButton variant="secondary" onClick={onClick}>
      <ProviderIcon
        integrationType={integrationName}
        externalEntityProviderId={externalEntityProviderId}
      />
      <span className="ml-1">Create Ticket</span>
    </AsyncButton>
  );
};
