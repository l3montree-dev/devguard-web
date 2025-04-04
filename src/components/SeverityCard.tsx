import Link from "next/link";
import { FunctionComponent } from "react";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveAssetVersion } from "../hooks/useActiveAssetVersion";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { classNames } from "../utils/common";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const variantColors = {
  critical: "bg-red-700 text-white",
  high: "bg-red-500 text-white",
  medium: "bg-orange-500 text-white",
  low: "bg-blue-500 text-white",
};

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
    <div className="flex flex-col">
      <div className="my-2">
        <span
          className={classNames(
            "rounded-lg px-2 text-4xl font-bold",
            variantColors[variant],
          )}
        >
          {amountByRisk ?? 0}
        </span>
      </div>

      <div className={classNames("text-xs text-muted-foreground")}>
        <span>By CVSS you would have</span>
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
  variant: "high" | "medium" | "low" | "critical";
}

const SeverityCard: FunctionComponent<Props> = ({
  amountByRisk,
  amountByCVSS,
  variant,
  queryIntervalStart,
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const activeAssetVersion = useActiveAssetVersion()!;
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-center justify-between capitalize">
          {variant} severity
          <Link
            href={
              `/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/refs/${activeAssetVersion.slug}/risk-handling?` +
              new URLSearchParams({
                "filterQuery[raw_risk_assessment][is greater than]":
                  queryIntervalStart.toString(),
              })
            }
            className="text-xs !text-muted-foreground"
          >
            See all
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SeverityStats
          amountByRisk={amountByRisk}
          amountByCVSS={amountByCVSS}
          variant={variant}
        />
      </CardContent>
    </Card>
  );
};

export default SeverityCard;
