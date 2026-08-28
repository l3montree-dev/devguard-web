// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { FunctionComponent } from "react";

interface PathEdgeProps {
  // When actionable the edge becomes a button that disputes the call assumption.
  actionable?: boolean;
  onClick?: () => void;
}

const label = "calls vulnerable function";

const PathEdge: FunctionComponent<PathEdgeProps> = ({
  actionable = false,
  onClick,
}) => {
  const content = (
    <>
      <span className="whitespace-nowrap">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
    </>
  );

  // Solid background so the connector line reads as passing behind the edge.
  const baseClass =
    "flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 bg-background px-2 py-1 text-sm text-muted-foreground transition-colors";

  if (!actionable) {
    return (
      <span aria-hidden className={baseClass}>
        {content}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-testid="path-edge"
          onClick={onClick}
          className={cn(
            baseClass,
            "cursor-pointer hover:border-primary/50 hover:bg-accent hover:text-foreground",
          )}
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs font-normal">
        This edge assumes the vulnerable function is actually called along this
        path. If it isn&apos;t, click to create a VEX rule that dismisses this
        path — prefilled and testable against this vulnerability.
      </TooltipContent>
    </Tooltip>
  );
};

export default PathEdge;
