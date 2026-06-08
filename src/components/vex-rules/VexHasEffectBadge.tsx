import type { FunctionComponent } from "react";
import { classNames } from "@/utils/common";

interface VexEffectBadgeProps {
  effectCount: number;
}

const VexHasEffectBadge: FunctionComponent<VexEffectBadgeProps> = ({
  effectCount,
}) => {
  return (
    <span
      className={classNames(
        "inline-flex whitespace-nowrap items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        effectCount > 0
          ? "bg-muted text-muted-foreground ring-border"
          : "bg-warning-muted text-warning ring-warning-border",
      )}
    >
      {effectCount > 0
        ? `Applies to ${effectCount} finding${effectCount > 1 ? "s" : ""}`
        : "No effect"}
    </span>
  );
};

export default VexHasEffectBadge;
