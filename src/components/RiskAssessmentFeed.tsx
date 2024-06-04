import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import FlawState from "./common/FlawState";
import { FlawEventDTO } from "@/types/api/api";

const timeline = [
  {
    id: 1,
    content: "Applied to",
    userId: "Front End Developer",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    FlawState: FlawState,
    iconBackground: "bg-gray-400",
  },
  {
    id: 2,
    content: "Advanced to phone screening by",
    userId: "Bethany Blake",
    href: "#",
    date: "Sep 22",
    datetime: "2020-09-22",
    FlawState: FlawState,
    iconBackground: "bg-blue-500",
  },
  {
    id: 3,
    content: "Completed phone screening with",
    userId: "Martha Gardner",
    href: "#",
    date: "Sep 28",
    datetime: "2020-09-28",
    FlawState: FlawState,
    iconBackground: "bg-green-500",
  },
  {
    id: 4,
    content: "Advanced to interview by",
    userId: "Bethany Blake",
    href: "#",
    date: "Sep 30",
    datetime: "2020-09-30",
    FlawState: FlawState,
    iconBackground: "bg-blue-500",
  },
  {
    id: 5,
    content: "Completed interview with",
    userId: "Katherine Snyder",
    href: "#",
    date: "Oct 4",
    datetime: "2020-10-04",
    FlawState: FlawState,
    iconBackground: "bg-green-500",
  },
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example({
  events,
  eventIdx,
}: {
  events: FlawEventDTO[];
  eventIdx: number;
}) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div
                  className={classNames(
                    "flex h-8 items-center justify-center rounded-full pl-6 ring-8 ring-white",
                  )}
                >
                  {event.type}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.justification}
                      {"  "}
                      <span className="font-medium text-gray-900">
                        by {event.userId}
                      </span>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.createdAt}>{event.createdAt}</time>
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
