// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Skeleton } from "../ui/skeleton";

// Placeholder for an Ory flow while it streams in.
export default function FlowSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-5 w-1/2 self-center" />
    </div>
  );
}
