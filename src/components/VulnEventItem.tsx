import React, { FunctionComponent } from "react";
import { VulnEventDTO } from "../types/api/api";
import {
  defaultScanner,
  eventMessages,
  eventTypeMessages,
  findUser,
} from "../utils/view";

import Markdown from "react-markdown";

import { classNames } from "../utils/common";
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

interface Props {
  events: VulnEventDTO[];
  index: number;
  event: VulnEventDTO;
}
const VulnEventItem: FunctionComponent<Props> = ({ event, events, index }) => {
  const currentUser = useCurrentUser();
  const activeOrg = useActiveOrg();
  const user = findUser(event.userId, activeOrg, currentUser);
  const msg = eventMessages(event, index, events);
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
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset!.slug}/refs/${assetVersion!.slug}/flaws/${event.vulnId}`}
                  className="!text-inherit no-underline visited:text-inherit hover:text-inherit active:text-inherit"
                >
                  <div className="w-full">
                    <p className="w-full bg-card px-2 py-2 font-medium">
                      {
                        findUser(event.userId, activeOrg, currentUser)
                          .displayName
                      }{" "}
                      {eventTypeMessages(
                        event,
                        index,
                        event.vulnerabilityName || "a vulnerability",
                        events,
                      )}
                    </p>
                  </div>

                  {Boolean(msg) && (
                    <div className="mdx-editor-content w-full rounded p-2 text-sm text-muted-foreground">
                      <Markdown className={"text-foreground"}>{msg}</Markdown>
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-10 mt-2 flex flex-row gap-2 text-xs font-normal text-muted-foreground">
          <FormatDate dateString={event.createdAt} />
          <div className="flex flex-row items-start gap-2">
            {event.arbitraryJsonData.scannerIds?.split(" ").map((s) => (
              <Badge key={s} variant={"secondary"}>
                {s.replace(defaultScanner, "")}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
};

export default VulnEventItem;
