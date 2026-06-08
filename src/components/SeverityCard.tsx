import Link from "next/link";
import type { FunctionComponent } from "react";
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
import { Skeleton } from "./ui/skeleton";
import { useSearchParams } from "next/navigation";
import { WrenchIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface Props {
  currentAmount: number;
  queryIntervalStart?: number;
  queryIntervalEnd?: number;
  fixableAmount: number;
  variant: "high" | "medium" | "low" | "critical";
  mode?: "risk" | "cvss";
  isLoading: boolean;
}

const SeverityCard: FunctionComponent<Props> = ({
  currentAmount,
  fixableAmount,
  variant,
  queryIntervalStart,
  queryIntervalEnd,
  isLoading,
  mode = "risk",
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();
  const activeAssetVersion = useActiveAssetVersion();
  const searchParams = useSearchParams();
  const artifactName = searchParams?.get("artifact") ?? "";

  const applySQLFilter = (
    variant: Props["variant"],
  ): { [key: string]: string } => {
    const property = mode === "risk" ? "raw_risk_assessment" : "CVE.cvss";
    const result: { [key: string]: string } = {};

    switch (variant) {
      case "low":
        if (queryIntervalEnd !== undefined) {
          result[`filterQuery[${property}][is less than]`] =
            queryIntervalEnd.toString();
        }
        break;

      case "high":
      case "medium":
        if (queryIntervalEnd !== undefined) {
          result[`filterQuery[${property}][is less than]`] =
            queryIntervalEnd.toString();
        }
        if (queryIntervalStart !== undefined) {
          result[`filterQuery[${property}][is greater than]`] =
            queryIntervalStart.toString();
        }
        break;

      case "critical":
        if (queryIntervalStart !== undefined) {
          result[`filterQuery[${property}][is greater than]`] =
            queryIntervalStart.toString();
        }
        break;
    }

    return result;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="w-full h-26" />
      </Card>
    );
  }
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-start justify-between">
          <span>
            <span className="text-5xl">{currentAmount}</span>
          </span>
          {asset && (
            <Link
              href={
                `/${activeOrg.slug}/projects/${project.slug}/assets/${asset?.slug}/refs/${activeAssetVersion?.slug}/dependency-risks?` +
                new URLSearchParams({
                  ...applySQLFilter(variant),
                  ...(artifactName
                    ? {
                        ["filterQuery[artifact_dependency_vulns.artifact_artifact_name][is]"]:
                          artifactName,
                      }
                    : {}),
                })
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
              "px-2 mr-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
              getSeverityClassNames(variant.toUpperCase(), false),
            )}
          >
            {variant.toUpperCase()}
          </span>
          {fixableAmount > 0 && (
            <Tooltip>
              <TooltipTrigger className="p-0 m-0 h-[24px]">
                <Badge
                  className="p-1 border-none text-xs font-medium pr-2 m-0"
                  variant={"secondary"}
                >
                  <WrenchIcon className="h-3.5 text-muted-foreground w-3.5 mr-1" />
                  <span>{fixableAmount}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Those vulnerabilities can be fixed by a <strong>direct</strong>{" "}
                dependency update. Consider prioritizing these as they can be
                resolved faster.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityCard;
