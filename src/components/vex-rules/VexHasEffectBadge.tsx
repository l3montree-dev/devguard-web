import { FunctionComponent } from "react";
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
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        effectCount > 0
          ? "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-500/20",
      )}
    >
      {effectCount > 0 ? `Applies to ${effectCount} finding${effectCount > 2 ? "s" : ""}` : "No effect"}
    </span>
  );
};

export default VexHasEffectBadge;
