import { Badge } from "@/components/ui/badge";
import type { FunctionComponent } from "react";

interface VexEffectBadgeProps {
  effectCount: number;
}

const VexHasEffectBadge: FunctionComponent<VexEffectBadgeProps> = ({
  effectCount,
}) => {
  const hasEffect = effectCount > 0;

  // A rule that matches nothing is worth pointing out; one that does its job is
  // just a fact.
  return (
    <Badge
      variant={hasEffect ? "secondary" : "danger"}
      className="w-fit whitespace-nowrap"
    >
      {hasEffect
        ? `Applies to ${effectCount} finding${effectCount > 1 ? "s" : ""}`
        : "No effect"}
    </Badge>
  );
};

export default VexHasEffectBadge;
