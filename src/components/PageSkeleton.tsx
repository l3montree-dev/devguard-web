// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { classNames } from "../utils/common";
import SkeletonListItems from "./common/SkeletonListItems";
import { Skeleton } from "./ui/skeleton";

const PageSkeleton = () => {
  return (
    <main className="flex-1 font-body">
      <div
        className={classNames(
          "mx-auto min-h-screen max-w-screen-xl gap-4 px-6 pb-8 pt-6 lg:px-8",
        )}
      >
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-6 h-5 w-96" />
        <div className="flex flex-col gap-4">
          <SkeletonListItems />
        </div>
      </div>

      <div className="bg-footer">
        <footer className="mx-auto max-w-screen-xl px-6 py-8 text-sm text-footer-foreground lg:px-8">
          <div className="mb-2 flex flex-row gap-5">
            {["w-28", "w-16", "w-16", "w-24", "w-14"].map((width, el) => (
              <Skeleton key={el} className={`h-5 ${width}`} />
            ))}
          </div>
          <Skeleton className="h-5 w-full max-w-lg" />
        </footer>
      </div>
    </main>
  );
};

export default PageSkeleton;
