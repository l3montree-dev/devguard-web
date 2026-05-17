import type { FunctionComponent } from "react";
import { classNames } from "@/utils/common";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Accepted leads to comment but doesn't close vulns
  const isAccepted = typeString === "accepted";

  if (isAccepted) {
    return (
      <span
        className={classNames(
          "inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
          "bg-info-muted text-info ring-info-muted",
        )}
      >
        Accepted (Comment only)
      </span>
    );
  }

  const badge = (
    <span
      className={classNames(
        "inline-flex items-center rounded-md whitespace-nowrap px-2 py-1 text-xs font-medium ring-1 ring-inset",
        "bg-accent-muted text-accent-foreground ring-accent-muted",
      )}
    >
      False Positive
    </span>
  );

  return !!mechanicalJustification ? (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{mechanicalJustification}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    badge
  );
};

export default VexRuleResult;
