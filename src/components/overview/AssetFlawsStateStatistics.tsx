import { AssetOverviewDTO } from "@/types/api/api";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import {
  BugAntIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
  EnvelopeOpenIcon,
  MinusIcon,
  UsersIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function changeType(change: number) {
  if (change === 0) return "same";
  return change > 0 ? "increase" : "decrease";
}

export default function AssetFlawsStateStatistics({
  data,
}: {
  data: AssetOverviewDTO;
}) {
  const handledFlaws = data.assetFlawsStateStatistics.handled;
  const openedFlaws = data.assetFlawsStateStatistics.open;
  const totalFlaws = handledFlaws + openedFlaws;

  const lastHandled = data.assetFlawsStateStatistics.lastHandled;
  const lastOpen = data.assetFlawsStateStatistics.lastOpen;
  const totalLast = lastHandled + lastOpen;

  const handledChange = handledFlaws - lastHandled;
  const openedChange = openedFlaws - lastOpen;
  const totalChange = totalFlaws - totalLast;

  const stats = [
    {
      id: 1,
      name: "Total Flaws",
      stat: totalFlaws,
      icon: WrenchIcon,
      change: totalChange,
      changeType: changeType(totalChange),
    },
    {
      id: 2,
      name: "Handled Flaws",
      stat: handledFlaws,
      icon: CheckCircleIcon,
      change: handledChange,
      changeType: changeType(handledChange),
    },
    {
      id: 3,
      name: "Open Flaws",
      stat: openedFlaws,
      icon: BugAntIcon,
      change: openedChange,
      changeType: changeType(openedChange),
    },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold leading-6">Last 30 days</h3>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg  px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-secondary p-3">
                <item.icon
                  aria-hidden="true"
                  className="h-6 w-6 text-muted-foreground"
                />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === "decrease"
                    ? "text-green-600"
                    : item.changeType === "increase"
                      ? "text-red-600"
                      : "text-muted-foreground",
                  "ml-2 flex items-baseline text-sm font-semibold",
                )}
              >
                {item.changeType === "increase" ? (
                  <ArrowUpIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 self-center text-red-600"
                  />
                ) : item.changeType === "decrease" ? (
                  <ArrowDownIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 self-center text-green-600"
                  />
                ) : (
                  <MinusIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 self-center text-muted-foreground"
                  />
                )}

                <span className="sr-only">
                  {item.changeType === "increase"
                    ? "Increased"
                    : item.changeType === "decrease"
                      ? "Decreased"
                      : "Remained the same"}{" "}
                  by
                </span>
                {item.change}
              </p>
              <div className="absolute inset-x-0 bottom-0  px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all<span className="sr-only"> {item.name} stats</span>
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
