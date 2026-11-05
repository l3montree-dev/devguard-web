// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Globe, LockKeyhole } from "lucide-react";
import type { FunctionComponent } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface Props {
  isPublic: boolean;
  type: "project" | "asset";
}

const VisibilityIcon: FunctionComponent<Props> = ({ isPublic, type }) => {
  const Icon = isPublic ? Globe : LockKeyhole;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-50">
        {isPublic
          ? `Public - anyone with the link can view this ${type}`
          : "Private - this can be changed in the settings under Danger Zone"}
      </TooltipContent>
    </Tooltip>
  );
};

export default VisibilityIcon;
