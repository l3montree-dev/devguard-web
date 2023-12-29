// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { classNames } from "@/utils/common";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";

const stats = [
  {
    name: "Total Unhandled Flaws",
    stat: "12",
    previousStat: "792",
    change: "12%",
    changeType: "decrease",
  },
  {
    name: "Total Pending Mitigations",
    stat: "32",
    previousStat: "792",
    change: "2.02%",
    changeType: "increase",
  },
  {
    name: "Avg. Time Till Handeled",
    stat: "3d 4h",
    previousStat: "",
    change: "4.05%",
    changeType: "decrease",
  },
];

export default function SingleStatGroup() {
  return (
    <div>
      <h3 className="text-sm leading-6">Last 30 days</h3>
      <dl className="mt-2 grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="px-4 rounded-lg shadow-sm border bg-white py-5 sm:p-6"
          >
            <dt className="text-base font-normal">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-black">
                {item.stat}
                <span className="ml-2 text-sm font-medium">
                  from {item.previousStat}
                </span>
              </div>

              <div
                className={classNames(
                  item.changeType === "decrease" &&
                    item.name !== "Avg. Time Till Handeled"
                    ? "bg-green-200 text-green-900"
                    : item.changeType === "decrease" &&
                      item.name === "Avg. Time Till Handeled"
                    ? "bg-green-200 text-green-900"
                    : "bg-red-200 text-red-900",
                  "inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0",
                )}
              >
                {item.changeType === "decrease" &&
                item.name !== "Avg. Time Till Handeled" ? (
                  <ArrowDownIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-800"
                    aria-hidden="true"
                  />
                ) : item.changeType === "decrease" &&
                  item.name === "Avg. Time Till Handeled" ? (
                  <ArrowDownIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-800"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowUpIcon
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-800"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only">
                  {" "}
                  {item.changeType === "decrease" &&
                  item.name !== "Avg. Time Till Handeled"
                    ? "Increased"
                    : "Decreased"}{" "}
                  by{" "}
                </span>
                {item.change}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
