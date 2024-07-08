import React, { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface Props {}
const SkeletonListItem: FunctionComponent<Props> = () => {
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
