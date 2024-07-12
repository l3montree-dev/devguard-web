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
import { FlawEventDTO } from "@/types/api/api";
import { getUsername } from "@/utils/view";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  StopIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback } from "../ui/avatar";
import FormatDate from "./FormatDate";
import { Badge } from "../ui/badge";

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
  }
}

const eventTypeMessages = (type: FlawEventDTO["type"], flawName: string) => {
  switch (type) {
    case "accepted":
      return "accepted the risk of " + flawName;
    case "fixed":
      return "fixed " + flawName;
    case "detected":
      return "detected " + flawName;
    case "falsePositive":
      return "marked " + flawName + " as false positive ";
    case "rawRiskAssessmentUpdated":
      return "updated the risk assessment of " + flawName + " automatically";
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
            <div className="">
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  {event.userId !== "system" && (
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
                  <div>
                    <p className="font-medium">
                      {getUsername(event.userId, org, currentUser).displayName}{" "}
                      {eventTypeMessages(event.type, flawName)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {maybeAddDot(event.justification)}

                      {event.type === "rawRiskAssessmentUpdated" && (
                        <>
                          {" "}
                          Risk Assessment changed from{" "}
                          {event.arbitraryJsonData.oldRiskAssessment} to{" "}
                          {event.arbitraryJsonData.newRiskAssessment}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs font-normal text-muted-foreground">
                <FormatDate dateString={event.createdAt} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
