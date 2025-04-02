import Link from "next/link";
import { useActiveAsset } from "../hooks/useActiveAsset";
import { useActiveAssetVersion } from "../hooks/useActiveAssetVersion";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { classNames } from "../utils/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { FunctionComponent } from "react";

interface Props {
  amountByRisk: number;
  amountByCVSS: number;
  queryIntervalStart: number;
  title: string;
}
const SeverityCard: FunctionComponent<Props> = ({
  amountByRisk,
  amountByCVSS,
  title,
  queryIntervalStart,
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset()!;
  const activeAssetVersion = useActiveAssetVersion()!;
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-center justify-between">
          {title}
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
        <div className="flex flex-col">
          <div className={classNames("flex flex-col", "text-muted-foreground")}>
            <span className={classNames("text-4xl font-bold")}>
              {amountByRisk ?? 0}
            </span>
          </div>

          <div className={classNames("text-xs text-muted-foreground")}>
            <span>By CVSS you would have</span>
            <span className={classNames("inline px-1 font-bold")}>
              {amountByCVSS ?? 0}
            </span>
            {title.toLowerCase()} vulnerabilities
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityCard;
