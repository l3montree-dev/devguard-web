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

import { FlawEventDTO } from "@/types/api/api";
import FormatDate from "./FormatDate";
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  SpeakerXMarkIcon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function EventTypeIcon({ eventType }: { eventType: FlawEventDTO["type"] }) {
  switch (eventType) {
    case "accepted":
      return <SpeakerXMarkIcon />;
    case "fixed":
      return <CheckIcon />;
    case "detected":
      return <MagnifyingGlassIcon />;
    case "falsePositive":
      return <XMarkIcon />;
    case "markedForMitigation":
      return <WrenchIcon />;
    case "markedForTransfer":
      return <ArrowRightStartOnRectangleIcon />;
    case "rawRiskAssessmentUpdated":
      return <ArrowPathIcon />;
  }
}

export default function RiskAssessmentFeed({
  events,
  flawName,
}: {
  events: FlawEventDTO[];
  flawName: string;
}) {
  return (
    <div>
      <ul className="relative flex flex-col gap-4 text-foreground" role="list">
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
                <p className="font-medium">
                  {event.userId} {event.type} {flawName}
                </p>
                <p className="mb-1 text-sm ">{event.justification}</p>
                {event.type === "rawRiskAssessmentUpdated" && (
                  <p className="font-medium">
                    Risk Assessment changed from{" "}
                    {event.arbitraryJsonData.oldRiskAssessment} to{" "}
                    {event.arbitraryJsonData.newRiskAssessment}
                  </p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <FormatDate dateString={event.createdAt} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
