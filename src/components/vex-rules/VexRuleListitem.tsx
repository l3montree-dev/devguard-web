import type { VexRule } from "@/types/api/api";
import type { FunctionComponent } from "react";
import VexRuleResult from "./VexRuleResult";

interface VexRuleListitemProps {
  rule: VexRule;
  onClick: () => void;
}

const VexRuleListitem: FunctionComponent<VexRuleListitemProps> = ({
  rule,
  onClick,
}) => {

  return (
    <button
      key={rule.id}
      onClick={onClick}
      className="flex flex-row items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-medium truncate">
          {rule.pathPattern?.join(" > ") || "No pattern"}
        </span>
        {rule.justification && (
          <span className="text-xs text-muted-foreground truncate">
            {rule.justification}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <VexRuleResult
          eventType={rule.eventType}
          mechanicalJustification={rule.mechanicalJustification}
        />
      </div>
    </button>
  );
};

export default VexRuleListitem;
