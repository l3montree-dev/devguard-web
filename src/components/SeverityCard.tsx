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
import { Skeleton } from "./ui/skeleton";
import { useSearchParams } from "next/navigation";

interface Props {
  currentAmount: number;
  queryIntervalStart: number;
  queryIntervalEnd: number;
  variant: "high" | "medium" | "low" | "critical";
  mode?: "risk" | "cvss";
  isLoading: boolean;
}

const SeverityCard: FunctionComponent<Props> = ({
  currentAmount,
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

    switch (variant) {
      case "low":
        return {
          [`filterQuery[${property}][is less than]`]:
            queryIntervalEnd.toString(),
        };

      case "high":
      case "medium":
        return {
          [`filterQuery[${property}][is less than]`]:
            queryIntervalEnd.toString(),
          [`filterQuery[${property}][is greater than]`]:
            queryIntervalStart.toString(),
        };

      case "critical":
        return {
          [`filterQuery[${property}][is greater than]`]:
            queryIntervalStart.toString(),
        };
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="w-full h-26" />
      </Card>
    );
  }
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
                new URLSearchParams({
                  ...applySQLFilter(variant),
                  ...(artifactName && { artifact: artifactName }),
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
