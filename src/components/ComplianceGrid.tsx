import React, { FunctionComponent, useMemo } from "react";
import { PolicyEvaluation } from "../types/api/api";
import { classNames } from "../utils/common";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Props {
  compliance: Array<PolicyEvaluation>;
}
const ComplianceGrid: FunctionComponent<Props> = ({ compliance }) => {
  const controlsPassing = useMemo(
    () => compliance.filter((policy) => policy.result).length,
    [compliance],
  );

  return (
    <div>
      <div className="grid-cols-25 grid gap-1">
        {compliance.map((policy) => (
          <Tooltip key={policy.title}>
            <TooltipTrigger>
              <div
                className={classNames(
                  "aspect-square rounded-sm",
                  Boolean(policy.result)
                    ? " bg-green-500 shadow-green-400 drop-shadow"
                    : "border border-gray-500/30 bg-gray-500/20",
                )}
                key={policy.title}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{policy.title}</span>
                <span className="text-xs text-muted-foreground">
                  {policy.description}
                </span>
              </div>
              <span
                className={classNames(
                  "text-sm font-semibold",
                  Boolean(policy.result) ? "text-green-500" : "text-red-500",
                )}
              >
                {policy.result ? "Passing" : "Failing"}
              </span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2">
        <span className="text-sm">
          {controlsPassing}{" "}
          <span className="text-muted-foreground">
            / {compliance.length} Controls are passing (
            {((controlsPassing / compliance.length) * 100).toFixed(1)} %)
          </span>
        </span>
      </div>
    </div>
  );
};

export default ComplianceGrid;
