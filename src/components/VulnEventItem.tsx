import React, { FunctionComponent } from "react";
import { VulnEventDTO } from "../types/api/api";
import { defaultScanner, eventMessages, findUser } from "../utils/view";

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
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset!.slug}/refs/${assetVersion!.slug}/vulns/${event.vulnId}`}
                  className="!text-inherit no-underline visited:text-inherit hover:text-inherit active:text-inherit"
                >
                  <div className="w-full">
                    <p className="w-full bg-card px-2 py-2 font-medium">
                      {
                        findUser(event.userId, activeOrg, currentUser)
                          .displayName
                      }{" "}
                      <EventTypeMessages
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

const FoundIn: FunctionComponent<{
  vulnType: string;
  packageName: string | null;
  uri: string | null;
}> = ({ vulnType, packageName, uri }) => {
  if (vulnType === "firstPartyVuln") {
    return <span className="text-muted-foreground">{` ${uri} file`}</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <EcosystemImage packageName={packageName ?? ""} />

      {beautifyPurl(packageName ?? "")}
    </span>
  );
};

const EventTypeMessages: FunctionComponent<{
  event: VulnEventDTO;
  flawName: string;
}> = ({ event, flawName }) => {
  let title = "";
  let found = <></>;

  switch (event.type) {
    case "detectedOnAnotherBranch":
      title =
        "detected " + flawName + "on another ref:" + event.assetVersionName;
      found = (
        <>
          {" "}
          in{" "}
          <FoundIn
            vulnType={event.vulnType}
            packageName={event.packageName}
            uri={event.uri}
          />
        </>
      );
      break;
    case "addedScanner":
      title =
        "detected " +
        flawName +
        " with scanner: " +
        event.arbitraryJsonData.scannerIds.replace(defaultScanner, "");
      found = (
        <>
          {" "}
          in{" "}
          <FoundIn
            vulnType={event.vulnType}
            packageName={event.packageName}
            uri={event.uri}
          />
        </>
      );

      break;
    case "removedScanner":
      title =
        "removed scanner: " +
        event.arbitraryJsonData.scannerIds.replace(defaultScanner, "");
      found = (
        <>
          {" "}
          from{" "}
          <FoundIn
            vulnType={event.vulnType}
            packageName={event.packageName}
            uri={event.uri}
          />
        </>
      );
      break;
    case "ticketClosed":
      title = "closed the ticket for " + flawName;
      break;
    case "ticketDeleted":
      title = "deleted the ticket for " + flawName;
      break;
    case "mitigate":
      title = "created a ticket for " + flawName;
      break;
    case "reopened":
      title = "reopened " + flawName;
      break;
    case "accepted":
      title = "accepted the risk of " + flawName;
      break;
    case "fixed":
      title = "fixed " + flawName;
      break;
    case "comment":
      title = "added a comment to " + flawName;
      break;
    case "detected":
      if (event.vulnType === "firstPartyVuln") {
        title = "detected " + flawName;
      } else {
        title =
          "detected " +
          flawName +
          (event.arbitraryJsonData && "risk" in event.arbitraryJsonData
            ? " with a risk of " + (event.arbitraryJsonData as any).risk
            : "");
      }
      found = (
        <>
          {" "}
          in{" "}
          <FoundIn
            vulnType={event.vulnType}
            packageName={event.packageName}
            uri={event.uri}
          />
        </>
      );
      break;
    case "falsePositive":
      title = "marked " + flawName + " as false positive ";
      break;
    case "rawRiskAssessmentUpdated":
      const oldRisk = (event.arbitraryJsonData as any)?.oldRisk;
      if (oldRisk === undefined || oldRisk === null) {
        title =
          "updated the risk assessment to " +
          (event.arbitraryJsonData as any)?.risk;
      } else {
        title =
          "updated the risk assessment from " +
          oldRisk +
          " to " +
          (event.arbitraryJsonData as any)?.risk;
      }
      break;
  }
  return (
    <span>
      {title} {found}
    </span>
  );
};
