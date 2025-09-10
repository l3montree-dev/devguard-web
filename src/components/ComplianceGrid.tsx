import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/compat/router";
import { FunctionComponent, useMemo } from "react";
import { PolicyEvaluation } from "../types/api/api";
import { classNames } from "../utils/common";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Props {
  compliance: Array<PolicyEvaluation>;
}
const ComplianceGrid: FunctionComponent<Props> = ({ compliance }) => {
  const controlsPassing = useMemo(
    () => compliance.filter((policy) => policy.compliant).length,
    [compliance],
  );

  const router = useRouter();
  return (
    <div>
      <div className="grid-cols-25 grid gap-1">
        {compliance.map((policy) => (
          <Tooltip key={policy.title}>
            <TooltipTrigger
              onClick={() =>
                router.push(router.asPath + "/compliance/" + policy.id)
              }
            >
              <div
                className={classNames(
                  "aspect-square rounded-sm block",
                  Boolean(policy.compliant)
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
                  Boolean(policy.compliant) ? "text-green-500" : "text-red-500",
                )}
              >
                {policy.compliant ? "Passing" : "Failing"}
              </span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      {compliance.length !== 0 ? (
        <div className="mt-2">
          <span className="text-sm">
            {controlsPassing}{" "}
            <span className="text-muted-foreground">
              / {compliance.length} Controls are passing (
              {((controlsPassing / compliance.length) * 100).toFixed(1)} %)
            </span>
          </span>
        </div>
      ) : (
        <div className="mt-2">
          <span className="text-sm">
            <Badge variant={"outline"}>
              <CheckBadgeIcon className="-ml-2 h-8 w-8 text-gray-500" />
              <span className="pl-2 text-base">
                No compliance rules are activated
              </span>
            </Badge>
          </span>
        </div>
      )}
    </div>
  );
};

export default ComplianceGrid;
