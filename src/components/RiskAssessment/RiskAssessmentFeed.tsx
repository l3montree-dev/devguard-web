import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import FlawState from "../common/FlawState";
import { FlawEventDTO } from "@/types/api/api";
import FormatDate from "./FormatDate";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function RiskAssessmentFeed({
  events,
  eventIdx,
}: {
  events: FlawEventDTO[];
  eventIdx: number;
}) {
  return (
    <div className="m-2 mb-12 flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, index) => (
          <li
            key={event.id}
            className={index !== events.length - 1 ? "mb-8" : ""}
          >
            <div className="relative flex flex-col">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className=" flex space-x-3">
                <div
                  className={classNames(
                    "flex h-8 w-1/3 items-center justify-center rounded ring-2 ring-gray-200",
                  )}
                >
                  {event.type}
                </div>

                <div className="flex flex-1 flex-col pt-1.5">
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900">
                      by {event.userId}
                    </p>
                    <p className="mb-1 text-sm text-gray-500">
                      {event.justification}
                    </p>
                    <p className="font-medium text-gray-900">
                      Risk Assessment changed from{" "}
                      {event.arbitraryJsonData.oldRiskAssessment} to{" "}
                      {event.arbitraryJsonData.newRiskAssessment}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <FormatDate dateString={event.createdAt} />
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
