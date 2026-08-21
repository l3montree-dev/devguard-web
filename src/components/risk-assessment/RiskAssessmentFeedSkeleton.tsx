// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

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
              key={index}
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
                        <div className="w-full bg-card px-2 py-2 pr-20 font-medium">
                          <Skeleton className="w-full h-10" />
                        </div>
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
