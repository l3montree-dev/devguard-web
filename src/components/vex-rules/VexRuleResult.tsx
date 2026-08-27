// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowPathIcon,
  SpeakerXMarkIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import type {
  MechanicalJustificationType,
  VexRuleEventType,
} from "@/types/api/api";
import type { FunctionComponent } from "react";

interface VexRuleResultProps {
  eventType: VexRuleEventType;
  mechanicalJustification?: MechanicalJustificationType;
}

const VexRuleResult: FunctionComponent<VexRuleResultProps> = ({
  eventType,
  mechanicalJustification,
}) => {
  // Accepted leaves the vulnerability open; a false positive closes it out;
  // reopen brings a previously closed vulnerability back to open.
  if (eventType === "accepted") {
    return (
      <Badge variant="yellow" className="w-fit whitespace-nowrap gap-1 py-1">
        <SpeakerXMarkIcon className="h-4 w-4" />
        Accepted
      </Badge>
    );
  }

  if (eventType === "reopened") {
    return (
      <Badge
        variant="destructive"
        className="w-fit whitespace-nowrap gap-1 py-1"
      >
        <ArrowPathIcon className="h-4 w-4" />
        Reopened
      </Badge>
    );
  }

  const badge = (
    <Badge variant="success" className="w-fit whitespace-nowrap gap-1 py-1">
      <StopIcon className="h-4 w-4" />
      False Positive
    </Badge>
  );

  return mechanicalJustification ? (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs font-normal">{mechanicalJustification}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    badge
  );
};

export default VexRuleResult;
