import Link from "next/link";
import { FunctionComponent } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveAssetVersion } from "../hooks/useActiveAssetVersion";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { classNames } from "../utils/common";
import { getSeverityClassNames } from "./common/Severity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const SeverityStats = ({
  amountByRisk,
  amountByCVSS,
  variant,
}: {
  amountByRisk: number;
  amountByCVSS: number;
  variant: "high" | "medium" | "low" | "critical";
}) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="my-2">
        <span
          className={classNames(
            "whitespace-nowrap rounded-lg bg-secondary px-2 text-4xl font-bold",
            //variantColors[variant],
          )}
        >
          {amountByRisk ?? 0}
        </span>
      </div>

      <div className={classNames("text-xs text-muted-foreground")}>
        <span>By Risk. By CVSS you would have</span>
        <span className={classNames("inline px-1 font-bold")}>
          {amountByCVSS ?? 0}
        </span>
        {variant} severity vulnerabilities
      </div>
    </div>
  );
};
interface Props {
  amountByRisk: number;
  amountByCVSS: number;
  queryIntervalStart: number;
  queryIntervalEnd: number;
  variant: "high" | "medium" | "low" | "critical";
}

const SeverityCard: FunctionComponent<Props> = ({
  amountByRisk,
  amountByCVSS,
  variant,
  queryIntervalStart,
  queryIntervalEnd,
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const activeAssetVersion = useActiveAssetVersion()!;

  const applySQLFilter = (
    variant: Props["variant"],
  ):
    | {
        "filterQuery[raw_risk_assessment][is less than]": string;
      }
    | {
        "filterQuery[raw_risk_assessment][is less than]": string;
        "filterQuery[raw_risk_assessment][is greater than]": string;
      }
    | {
        "filterQuery[raw_risk_assessment][is greater than]": string;
      } => {
    switch (variant) {
      case "low":
        return {
          "filterQuery[raw_risk_assessment][is less than]":
            queryIntervalEnd.toString(),
        };

      case "medium":
        return {
          "filterQuery[raw_risk_assessment][is greater than]":
            queryIntervalStart.toString(),
          "filterQuery[raw_risk_assessment][is less than]":
            queryIntervalEnd.toString(),
        };

      case "high":
        return {
          "filterQuery[raw_risk_assessment][is greater than]":
            queryIntervalStart.toString(),
          "filterQuery[raw_risk_assessment][is less than]":
            queryIntervalEnd.toString(),
        };

      case "critical":
        return {
          "filterQuery[raw_risk_assessment][is greater than]":
            queryIntervalStart.toString(),
        };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-start justify-between">
          <span>
            <span className="text-5xl">{amountByRisk}</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-muted-foreground ml-2">
                  ({amountByCVSS})
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {amountByCVSS} {variant} severity vulnerabilities by CVSS.
              </TooltipContent>
            </Tooltip>
          </span>
          <Link
            href={
              `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${activeAssetVersion.slug}/dependency-risks?` +
              new URLSearchParams(applySQLFilter(variant))
            }
            className="text-xs !text-muted-foreground"
          >
            See all
          </Link>
        </CardTitle>
        <CardDescription>Amount of vulnerabilities by Risk</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mr-2 flex">
          <span
            className={classNames(
              "px-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
              getSeverityClassNames(variant.toUpperCase(), false),
            )}
          >
            {variant.toUpperCase()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityCard;
