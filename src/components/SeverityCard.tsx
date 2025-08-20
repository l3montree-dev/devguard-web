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

interface Props {
  currentAmount: number;
  queryIntervalStart: number;
  queryIntervalEnd: number;
  variant: "high" | "medium" | "low" | "critical";
  mode?: "risk" | "cvss";
}

const SeverityCard: FunctionComponent<Props> = ({
  currentAmount,
  variant,
  queryIntervalStart,
  queryIntervalEnd,
  mode = "risk",
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const activeAssetVersion = useActiveAssetVersion();

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
            <span className="text-5xl">{currentAmount}</span>
          </span>
          {asset && (
            <Link
              href={
                `/${activeOrg.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/${activeAssetVersion?.slug}/dependency-risks?` +
                new URLSearchParams(applySQLFilter(variant))
              }
              className="text-xs !text-muted-foreground"
            >
              See all
            </Link>
          )}
        </CardTitle>
        <CardDescription>
          Amount of vulnerabilities by {mode === "risk" ? "Risk" : "CVSS"}
        </CardDescription>
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
