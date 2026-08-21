// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { classNames } from "@/utils/common";
import { InfoIcon } from "lucide-react";
import type { FunctionComponent, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

// A small (?) icon that shows an explanatory tooltip on hover/focus. Use this
// liberally for compliance/OSCAL jargon - our users are software developers,
// not compliance professionals, so terms like "component", "by-component", or
// "implementation status" need a plain-language explanation inline.
const InfoTooltip: FunctionComponent<Props> = ({ children, className }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={classNames(
            "inline-flex items-center text-muted-foreground hover:text-foreground",
            className,
          )}
        >
          <InfoIcon className="h-3.5 w-3.5" />
          <span className="sr-only">More info</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="font-normal">{children}</TooltipContent>
    </Tooltip>
  );
};

export default InfoTooltip;
