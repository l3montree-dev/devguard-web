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

import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  DetectedEventDTO,
  VulnEventDTO,
  RiskCalculationReport,
  RiskAssessmentUpdatedEventDTO,
} from "@/types/api/api";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveProject } from "@/hooks/useActiveProject";
import { findUser } from "@/utils/view";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";
import Markdown from "react-markdown";
import FormatDate from "./risk-assessment/FormatDate";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

function EventTypeIcon({ eventType }: { eventType: VulnEventDTO["type"] }) {
  switch (eventType) {
    case "accepted":
      return <SpeakerXMarkIcon />;
    case "fixed":
      return <CheckIcon />;
    case "detected":
      return <MagnifyingGlassIcon />;
    case "falsePositive":
      return <StopIcon />;
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
      `The probability of exploitation (EPSS) increased from ${(old.epss * 100).toFixed(2)}% to ${(n.epss * 100).toFixed(2)}%.`,
    );
  } else if (old.epss > n.epss) {
    // epss decreased
    changes.push(
      `The probability of exploitation (EPSS) decreased from ${(old.epss * 100).toFixed(2)}% to ${(n.epss * 100).toFixed(2)}%.`,
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

const eventMessages = (
  event: VulnEventDTO,
  index: number,
  events?: VulnEventDTO[],
) => {
  switch (event.type) {
    case "rawRiskAssessmentUpdated":
      if (events === undefined) {
        return "";
      }
      // get the last risk calculation report.
      const beforeThisEvent = events.slice(0, index);
      const lastRiskEvent = beforeThisEvent.findLast(
        (e) => e.type === "rawRiskAssessmentUpdated" || e.type === "detected",
      ) as DetectedEventDTO | RiskAssessmentUpdatedEventDTO | undefined;
      if (!lastRiskEvent) return "";
      return diffReports(
        lastRiskEvent?.arbitraryJsonData,
        event.arbitraryJsonData,
      );
  }
  return "";
};

const eventTypeMessages = (
  event: VulnEventDTO,
  index: number,
  flawName: string,
  events?: VulnEventDTO[],
) => {
  switch (event.type) {
    case "reopened":
      return "reopened " + flawName;
    case "accepted":
      return "accepted the risk of " + flawName;
    case "fixed":
      return "fixed " + flawName;
    case "comment":
      return "added a comment to " + flawName;
    case "detected":
      return (
        "detected " +
        flawName +
        " with a risk of " +
        event.arbitraryJsonData.risk
      );
    case "falsePositive":
      return "marked " + flawName + " as false positive ";
    case "rawRiskAssessmentUpdated":
      if (events === undefined) {
        return (
          "Updated the risk assessment of " +
          flawName +
          " to " +
          event.arbitraryJsonData.risk
        );
      }
      // get the last risk calculation report.
      const beforeThisEvent = events.slice(0, index);
      const lastRiskEvent = beforeThisEvent.findLast(
        (e) => e.type === "rawRiskAssessmentUpdated" || e.type === "detected",
      );
      return (
        "updated the risk assessment from " +
        ((lastRiskEvent as RiskAssessmentUpdatedEventDTO)?.arbitraryJsonData
          .risk ?? 0) +
        " to " +
        event.arbitraryJsonData.risk
      );
  }
  return "";
};

const maybeAddDot = (str: string) => {
  if (!str) return "";

  // check if string ends with a dot, exclamtion mark or question mark
  if (str.match(/(\.|!|\?)$/)) return str;

  return str + ".";
};

interface ActivityLogProps {
  event: VulnEventDTO;
  index: number;
  events?: VulnEventDTO[];
  flawName: string;
}

export const ActivityLogElement: FunctionComponent<ActivityLogProps> = ({
  event,
  index,
  events,
  flawName,
}) => {
  const org = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const currentUser = useCurrentUser();
  const user = findUser(event.userId, org, currentUser);
  return (
    <li className="relative flex flex-row items-start gap-4" key={event.id}>
      <Link
        href={`/organizations/${org}/projects/${project?.slug}/assets/${asset?.slug}/vulns/${event.vulnId}`}
      ></Link>

      <div className="h-7 w-7 rounded-full border-2 border-background bg-secondary p-1 text-muted-foreground">
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
                <AvatarFallback className="bg-secondary">
                  {user.realName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="w-full rounded border ">
              <p className="bg-card px-2 py-2 font-medium">
                {user.displayName}{" "}
                {eventTypeMessages(event, index, flawName, events)}
              </p>
              <div className="flex justify-between">
                <div>
                  {Boolean(event.justification) && (
                    <div className="mdx-editor-content w-full rounded p-2 text-sm text-muted-foreground">
                      <Markdown className={"text-foreground"}>
                        {event.type === "rawRiskAssessmentUpdated"
                          ? eventMessages(event, index, events)
                          : maybeAddDot(event.justification)}
                      </Markdown>
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    href={`/${org.slug}/projects/${project?.slug}/assets/${asset?.slug}/vulns/${event.vulnId}`}
                  >
                    <Button size="sm">to Flaw</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-10 mt-2 text-xs font-normal text-muted-foreground">
          <FormatDate dateString={event.createdAt} />
        </div>
      </div>
    </li>
  );
};
