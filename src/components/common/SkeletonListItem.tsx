import React, { type FunctionComponent } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface Props {
  variant?: "card" | "project";
}
const SkeletonListItem: FunctionComponent<Props> = ({ variant = "card" }) => {
  if (variant === "project") {
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
  }

  return (
    <Card className="flex flex-row items-center justify-between">
      <CardHeader className="flex-1">
        <div className="text-base">
          <Skeleton className="h-7 w-52" />
        </div>
        <div>
          <Skeleton className="h-5 w-1/3" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-none items-center gap-x-4">
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonListItem;
