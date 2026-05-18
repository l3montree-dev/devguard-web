import React, { type FunctionComponent } from "react";
import { Skeleton } from "../ui/skeleton";

interface Props {}
const SkeletonListItem: FunctionComponent<Props> = () => {
  return (
    <div className="border-b py-2">
      <div className="flex flex-row items-center gap-3 px-4 py-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex flex-1 min-w-0 flex-col gap-1.5">
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-4 w-4 shrink-0 mr-3" />
      </div>
    </div>
  );
};

export default SkeletonListItem;
