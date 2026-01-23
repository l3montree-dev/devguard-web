import React, { FunctionComponent } from "react";
import { VulnEventDTO } from "../types/api/api";
import {
  defaultScanner,
  eventMessages,
  eventTypeMessages,
  findUser,
} from "../utils/view";

import Markdown from "react-markdown";

import { beautifyPurl, classNames } from "../utils/common";
import FormatDate from "./risk-assessment/FormatDate";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useActiveOrg } from "../hooks/useActiveOrg";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { useActiveProject } from "../hooks/useActiveProject";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveAssetVersion } from "../hooks/useActiveAssetVersion";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EcosystemImage from "./common/EcosystemImage";
import { Tooltip, TooltipContent } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

interface Props {
  events: VulnEventDTO[];
  index: number;
  event: VulnEventDTO;
}
const VulnEventItem: FunctionComponent<Props> = ({ event, events, index }) => {
  const currentUser = useCurrentUser();
  const activeOrg = useActiveOrg();
  const user = findUser(event.userId, activeOrg, currentUser);
  const msg = eventMessages(event);
  const project = useActiveProject();
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();
  return (
    <li
      className={classNames(
        "relative flex flex-row items-start gap-4 transition-all",
      )}
      key={event.id}
    >
      <div className="w-full">
        <div className="flex w-full flex-col">
          <div className="flex w-full flex-row items-start gap-2">
            <div className="-ml-0.5">
              {event.userId === "system" ? (
                <Avatar>
                  <AvatarFallback className="bg-secondary">
                    <Image
                      width={20}
                      height={20}
                      src="/logo_icon.svg"
                      alt="logo"
                    />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  {Boolean(user?.avatarUrl) && (
                    <AvatarImage src={user?.avatarUrl} alt={event.userId} />
                  )}
                  <AvatarFallback className="bg-secondary">
                    {user.realName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-1">
              <div className="w-full flex-1 overflow-hidden rounded border">
                <Link
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/${event.vulnType === "dependencyVuln" ? "dependency-risks" : "code-risks"}/${event.vulnId}`}
                  className="!text-inherit no-underline visited:text-inherit hover:text-inherit active:text-inherit"
                >
                  <div className="w-full">
                    <p className="w-full bg-card px-2 py-2 font-medium">
                      {
                        findUser(event.userId, activeOrg, currentUser)
                          .displayName
                      }{" "}
                      <FoundIn
                        event={event}
                        flawName={event.vulnerabilityName || "a vulnerability"}
                      />
                    </p>
                  </div>

                  {Boolean(msg) && (
                    <div className="mdx-editor-content w-full rounded p-2 text-sm text-foreground">
                      <Markdown>{msg}</Markdown>
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-10 mt-2 flex flex-row gap-2 text-xs font-normal text-muted-foreground">
          <FormatDate dateString={event.createdAt} />
          <div className="flex flex-1 flex-row items-start gap-2">
            {event.arbitraryJSONData.scannerIds?.split(" ").map((s) => (
              <Tooltip key={s}>
                <TooltipTrigger asChild>
                  <Badge className="line-clamp-1" variant={"secondary"}>
                    {s.replace(defaultScanner, "")}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{s}</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
};

export default VulnEventItem;

const FoundIn: FunctionComponent<{
  event: VulnEventDTO;
  flawName: string;
}> = ({ event, flawName }) => {
  const title = eventTypeMessages(event, flawName);
  let found = <></>;

  if (event.type === "detected") {
    if (event.vulnType === "firstPartyVuln") {
      found = (
        <span className="text-muted-foreground">
          {" in "}
          <span>{` ${event.uri} file`}</span>
        </span>
      );
    } else if (event.vulnType === "dependencyVuln") {
      found = (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          {" in "}
          <span className="inline-flex flex-shrink-0">
            <EcosystemImage packageName={event.packageName ?? ""} size={16} />
          </span>
          {beautifyPurl(event.packageName ?? "")}
        </span>
      );
    }
  }

  return (
    <span>
      {title}
      {found}
    </span>
  );
};
