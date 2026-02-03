import { FunctionComponent } from "react";
import { classNames } from "@/utils/common";
import { vexOptionMessages } from "@/utils/view";
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

  // Determine if it's a false positive variant
  const isFalsePositive =
    typeString === "falsePositive" ||
    typeString === "markedForTransfer" ||
    typeString === "detectedOnAnotherBranch";

  // Accepted leads to comment but doesn't close vulns
  const isAccepted = typeString === "accepted";

  if (isFalsePositive) {
    const tooltipMessage = mechanicalJustification
      ? vexOptionMessages[mechanicalJustification]
      : null;

    const badge = (
      <span
        className={classNames(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
          "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20",
        )}
      >
        False Positive
      </span>
    );

    if (tooltipMessage) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return badge;
  }

  if (isAccepted) {
    return (
      <span
        className={classNames(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
          "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
        )}
      >
        Accepted (Comment only)
      </span>
    );
  }

  // Fallback for other types
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
      )}
    >
      {typeString}
    </span>
  );
};

export default VexRuleResult;
