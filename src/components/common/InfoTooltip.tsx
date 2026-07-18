// Copyright (C) 2026 l3montree GmbH
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
