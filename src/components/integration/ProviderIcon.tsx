// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Renders nothing unless a ticket can actually be created — that needs a linked

import type { ExternalTicketProvider } from "@/types/common";
import type { FunctionComponent } from "react";
import GitProviderIcon from "../GitProviderIcon";
import Image from "next/image";

// issue tracker and a vulnerability that doesn't have a ticket yet.
export const ProviderIcon: FunctionComponent<{
  integrationType: ExternalTicketProvider | undefined;
  externalEntityProviderId?: string;
}> = ({ integrationType, externalEntityProviderId }) => {
  switch (integrationType) {
    case "gitlab":
      return (
        <GitProviderIcon
          externalEntityProviderIdOrRepositoryId={
            externalEntityProviderId ?? "gitlab"
          }
        />
      );
    case "github":
      return (
        <Image
          alt="GitHub Logo"
          width={15}
          height={15}
          className="dark:invert"
          src={"/assets/github.svg"}
        />
      );
    case "jira":
      return (
        <Image
          alt="Jira Logo"
          width={15}
          height={15}
          src={"/assets/jira-svgrepo-com.svg"}
        />
      );
    case "redmine":
      return (
        <Image
          alt="Redmine Logo"
          width={15}
          height={15}
          src={"/assets/provider-icons/redmine.svg"}
        />
      );
    default:
      return null;
  }
};
