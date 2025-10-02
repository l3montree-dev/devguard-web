// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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

import { classNames } from "@/utils/common";
import { Skeleton } from "../ui/skeleton";

export default function RiskAssessmentFeedSkeleton() {
  return (
    <div>
      <ul
        className="relative flex flex-col gap-10 pb-10 text-foreground"
        role="list"
      >
        <div className="absolute left-3 h-full border-l border-r bg-secondary" />
        {Array.from(Array(3)).map((event, index) => {
          return (
            <li
              className={classNames(
                "opacity-75",
                "relative flex flex-row items-start gap-4 transition-all",
              )}
              key={event}
            >
              <div
                className={classNames(
                  "h-7 w-7 rounded-full bg-muted text-white border-2 flex flex-row items-center justify-center border-background p-1",
                )}
              >
                <Skeleton className="h-6 w-7 rounded-full" />
              </div>
              <div className="w-full">
                <div className="flex w-full flex-col">
                  <div className="flex flex-row items-start gap-2">
                    <Skeleton className="rounded-full h-[30px] w-[30px]" />
                    <div className="w-full overflow-hidden rounded border">
                      <div className="w-full">
                        <p className="w-full bg-card px-2 py-2 pr-20 font-medium">
                          <Skeleton className="w-full h-10" />
                        </p>
                      </div>

                      <div className="mdx-editor-content p-2">
                        <Skeleton className="w-full h-20" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-10 mt-2 text-xs font-normal text-muted-foreground">
                  <Skeleton className="w-20 h-4" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
