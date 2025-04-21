// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VulnEventDTO, RiskCalculationReport } from "@/types/api/api";
import { classNames } from "@/utils/common";
import {
  eventMessages,
  eventTypeMessages,
  evTypeBackground,
  findUser,
} from "@/utils/view";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  StopIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { GitBranchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import FormatDate from "./FormatDate";

function EventTypeIcon({ eventType }: { eventType: VulnEventDTO["type"] }) {
  switch (eventType) {
    case "ticketClosed":
      return <CheckIcon />;
    case "ticketDeleted":
      return <StopIcon />;

    case "accepted":
      return <SpeakerXMarkIcon />;
    case "fixed":
      return <CheckIcon />;
    case "detected":
      return <MagnifyingGlassIcon />;
    case "falsePositive":
      return <StopIcon />;
    case "mitigate":
      return <WrenchIcon />;
    case "markedForTransfer":
      return <ArrowRightStartOnRectangleIcon />;
    case "rawRiskAssessmentUpdated":
      return <ArrowPathIcon />;
    case "reopened":
      return <MagnifyingGlassIcon />;
    case "comment":
      return <ChatBubbleOvalLeftEllipsisIcon />;
  }
}

const diffReports = (
  old: RiskCalculationReport,
  n: RiskCalculationReport,
): string => {
  // check what changed
  const changes = [];
  if (old.epss < n.epss) {
    // epss increased
    changes.push(
      `The probability of exploitation (EPSS) increased from ${(old.epss * 100).toFixed(1)}% to ${(n.epss * 100).toFixed(1)}%.`,
    );
  } else if (old.epss > n.epss) {
    // epss decreased
    changes.push(
      `The probability of exploitation (EPSS) decreased from ${(old.epss * 100).toFixed(1)}% to ${(n.epss * 100).toFixed(1)}%.`,
    );
  }

  if (!old.exploitExists && n.exploitExists && n.verifiedExploitExists) {
    changes.push("An exploit was discovered and verified.");
  } else if (old.exploitExists && !n.exploitExists) {
    changes.push("An already discovered exploit was removed.");
  } else if (!old.verifiedExploitExists && n.verifiedExploitExists) {
    changes.push("An exploit was verified.");
  }

  if (old.confidentialityRequirement !== n.confidentialityRequirement) {
    changes.push(
      `Confidentiality requirement changed from ${old.confidentialityRequirement} to ${n.confidentialityRequirement}.`,
    );
  }

  if (old.integrityRequirement !== n.integrityRequirement) {
    changes.push(
      `Integrity requirement changed from ${old.integrityRequirement} to ${n.integrityRequirement}.`,
    );
  }

  if (old.availabilityRequirement !== n.availabilityRequirement) {
    changes.push(
      `Availability requirement changed from ${old.availabilityRequirement} to ${n.availabilityRequirement}.`,
    );
  }

  return changes.join(" ");
};

export default function RiskAssessmentFeed({
  events,
  vulnerabilityName,
}: {
  events: VulnEventDTO[];
  vulnerabilityName: string;
}) {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const currentUser = useCurrentUser();

  const activeAssetVersion = useActiveAssetVersion();

  return (
    <div>
      <ul
        className="relative flex flex-col gap-10 pb-10 text-foreground"
        role="list"
      >
        <div className="absolute left-3 h-full border-l border-r bg-secondary" />
        {events.map((event, index) => {
          const user = findUser(event.userId, org, currentUser);
          const msg = eventMessages(event, index, events);
          return (
            <li
              className={classNames(
                event.assetVersionName !== activeAssetVersion?.name &&
                  "opacity-75 hover:opacity-100",
                "relative flex flex-row items-start gap-4 transition-all",
              )}
              key={event.id}
            >
              <div
                className={classNames(
                  evTypeBackground[event.type],
                  "h-7 w-7 rounded-full border-2 border-background p-1",
                )}
              >
                <EventTypeIcon eventType={event.type} />
              </div>
              <div className="w-full">
                <div className="flex w-full flex-col">
                  <div className="flex flex-row items-start gap-2">
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
                          <AvatarImage
                            src={user?.avatarUrl}
                            alt={event.userId}
                          />
                        )}
                        <AvatarFallback className="bg-secondary">
                          {user.realName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="w-full overflow-hidden rounded border">
                      <div className="w-full">
                        <p className="w-full bg-card px-2 py-2 font-medium">
                          {findUser(event.userId, org, currentUser).displayName}{" "}
                          {eventTypeMessages(
                            event,
                            index,
                            vulnerabilityName,
                            events,
                          )}
                        </p>

                        <div className="absolute right-2 top-2">
                          <Link
                            href={`/${org.slug}/projects/${project.slug}/assets/${asset!.slug}/refs/${event.assetVersionSlug}/flaws/${event.vulnId}`}
                          >
                            <Badge variant={"outline"}>
                              <GitBranchIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                              {event.assetVersionName}
                            </Badge>
                          </Link>
                        </div>
                      </div>

                      {Boolean(msg) && (
                        <div className="mdx-editor-content w-full rounded p-2 text-sm text-muted-foreground">
                          <Markdown className={"text-foreground"}>
                            {msg}
                          </Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-10 mt-2 text-xs font-normal text-muted-foreground">
                  <FormatDate dateString={event.createdAt} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
