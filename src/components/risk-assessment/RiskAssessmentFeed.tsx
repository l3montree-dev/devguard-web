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
import { FlawEventDTO, RiskCalculationReport } from "@/types/api/api";
import { getUsername } from "@/utils/view";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  StopIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Markdown from "react-markdown";
import { Avatar, AvatarFallback } from "../ui/avatar";
import FormatDate from "./FormatDate";

function EventTypeIcon({ eventType }: { eventType: FlawEventDTO["type"] }) {
  switch (eventType) {
    case "accepted":
      return <SpeakerXMarkIcon />;
    case "fixed":
      return <CheckIcon />;
    case "detected":
      return <MagnifyingGlassIcon />;
    case "falsePositive":
      return <StopIcon />;
    case "markedForMitigation":
      return <WrenchIcon />;
    case "markedForTransfer":
      return <ArrowRightStartOnRectangleIcon />;
    case "rawRiskAssessmentUpdated":
      return <ArrowPathIcon />;
    case "reopened":
      return <MagnifyingGlassIcon />;
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
      `The probability of exploitation (EPSS) increased from ${old.epss * 100}% to ${n.epss * 100}%.`,
    );
  } else if (old.epss > n.epss) {
    // epss decreased
    changes.push(
      `The probability of exploitation (EPSS) decreased from ${old.epss * 100}% to ${n.epss * 100}%.`,
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
  event: FlawEventDTO,
  index: number,
  events: FlawEventDTO[],
  flawName: string,
) => {
  switch (event.type) {
    case "rawRiskAssessmentUpdated":
      // get the last risk calculation report.
      const beforeThisEvent = events.slice(0, index);
      const lastRiskEvent = beforeThisEvent.findLast(
        (e) => e.type === "rawRiskAssessmentUpdated" || e.type === "detected",
      );
      if (!lastRiskEvent) return "";
      return diffReports(
        lastRiskEvent?.arbitraryJsonData,
        event.arbitraryJsonData,
      );
  }
  return "";
};

const eventTypeMessages = (
  event: FlawEventDTO,
  index: number,
  events: FlawEventDTO[],
  flawName: string,
) => {
  switch (event.type) {
    case "reopened":
      return "reopened " + flawName;
    case "accepted":
      return "accepted the risk of " + flawName;
    case "fixed":
      return "fixed " + flawName;
    case "comment":
      return "added a comment";
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
      // get the last risk calculation report.
      const beforeThisEvent = events.slice(0, index);
      const lastRiskEvent = beforeThisEvent.findLast(
        (e) => e.type === "rawRiskAssessmentUpdated" || e.type === "detected",
      );
      return (
        "updated the risk assessment from " +
        (lastRiskEvent?.arbitraryJsonData.risk ?? 0) +
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

export default function RiskAssessmentFeed({
  events,
  flawName,
}: {
  events: FlawEventDTO[];
  flawName: string;
}) {
  const org = useActiveOrg();
  const currentUser = useCurrentUser();
  return (
    <div>
      <ul
        className="relative flex flex-col gap-10 pb-10 text-foreground"
        role="list"
      >
        <div className="absolute left-3 h-full border-l border-r bg-secondary" />
        {events.map((event, index) => (
          <li
            className="relative flex flex-row items-start gap-4"
            key={event.id}
          >
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
                        {getUsername(
                          event.userId,
                          org,
                          currentUser,
                        ).realName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="w-full rounded border ">
                    <p className="bg-card px-2 py-2 font-medium">
                      {getUsername(event.userId, org, currentUser).displayName}{" "}
                      {eventTypeMessages(event, index, events, flawName)}
                    </p>
                    {Boolean(event.justification) && (
                      <div className="mdx-editor-content w-full rounded p-2 text-sm text-muted-foreground">
                        <Markdown className={"text-foreground"}>
                          {maybeAddDot(event.justification)}
                        </Markdown>

                        {event.type === "rawRiskAssessmentUpdated" && (
                          <>
                            <span>
                              {" "}
                              {eventMessages(event, index, events, flawName)}
                            </span>
                          </>
                        )}
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
        ))}
      </ul>
    </div>
  );
}
