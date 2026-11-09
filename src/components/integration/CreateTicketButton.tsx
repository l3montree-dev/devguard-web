// Renders nothing unless a ticket can actually be created — that needs a linked

import type { ExternalTicketProvider } from "@/types/common";
import type { FunctionComponent } from "react";
import GitProviderIcon from "../GitProviderIcon";
import { Button } from "../ui/button";
import Image from "next/image";

// issue tracker and a vulnerability that doesn't have a ticket yet.
export const CreateTicketButton: FunctionComponent<{
  integrationName: ExternalTicketProvider | undefined;
  hasTicket: boolean;
  externalEntityProviderId?: string;
  onClick: () => void;
}> = ({ integrationName, hasTicket, externalEntityProviderId, onClick }) => {
  if (integrationName === undefined || hasTicket) return null;

  return (
    <Button variant="secondary" onClick={onClick}>
      {integrationName === "gitlab" && (
        <GitProviderIcon
          externalEntityProviderIdOrRepositoryId={
            externalEntityProviderId ?? "gitlab"
          }
        />
      )}
      {integrationName === "github" && (
        <Image
          alt="GitHub Logo"
          width={15}
          height={15}
          className="dark:invert"
          src={"/assets/github.svg"}
        />
      )}
      {integrationName === "jira" && (
        <Image
          alt="Jira Logo"
          width={15}
          height={15}
          src={"/assets/jira-svgrepo-com.svg"}
        />
      )}
      {integrationName === "redmine" && (
        <Image
          alt="Redmine Logo"
          width={15}
          height={15}
          src={"/assets/provider-icons/redmine.svg"}
        />
      )}
      <span className="ml-1">Create Ticket</span>
    </Button>
  );
};
