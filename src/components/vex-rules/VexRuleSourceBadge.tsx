// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link2 } from "lucide-react";
import type { FunctionComponent } from "react";

// What the backend stamps on rules created here; anything else is the upstream URL.
const MANUAL_VEX_SOURCE = "manual";

export const isManualVexRule = (vexSource: string): boolean =>
  vexSource === MANUAL_VEX_SOURCE;

/** Own rules need no adornment; synced ones reveal their URL on hover. */
const VexRuleSourceBadge: FunctionComponent<{ vexSource: string }> = ({
  vexSource,
}) => {
  if (isManualVexRule(vexSource)) {
    return <span className="text-xs text-muted-foreground">Own rule</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="w-fit cursor-default gap-1">
          <Link2 className="h-3 w-3" />
          Synced
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm break-all font-normal">
        {vexSource}
      </TooltipContent>
    </Tooltip>
  );
};

export default VexRuleSourceBadge;
