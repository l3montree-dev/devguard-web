import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SpeakerXMarkIcon, StopIcon } from "@heroicons/react/24/outline";
import type { FunctionComponent } from "react";

interface VexRuleResultProps {
  eventType: any; // VulnEventDTO or string
  mechanicalJustification?: string;
}

const VexRuleResult: FunctionComponent<VexRuleResultProps> = ({
  eventType,
  mechanicalJustification,
}) => {
  // Extract the type string - handle both object and string cases
  const typeString =
    typeof eventType === "string" ? eventType : eventType?.type || "unknown";

  // Accepted leads to a comment but leaves the vulnerability open — a warning.
  // A false positive closes it out.
  if (typeString === "accepted") {
    return (
      <Badge variant="yellow" className="w-fit whitespace-nowrap gap-1 py-1">
        <SpeakerXMarkIcon className="h-4 w-4" />
        Accepted
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
