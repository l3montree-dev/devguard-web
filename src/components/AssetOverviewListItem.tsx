import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { AssetDTO, PolicyEvaluation, RiskDistribution } from "../types/api/api";
import { classNames } from "../utils/common";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  asset: AssetDTO & {
    stats: {
      cvssDistribution: RiskDistribution;
      riskDistribution: RiskDistribution;
      compliance: Array<PolicyEvaluation>;
      licenses: Record<string, number>;
    };
  };
}
const AssetOverviewListItem: FunctionComponent<Props> = ({ asset }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const failingControls = useMemo(
    () => asset.stats.compliance.filter((policy) => !policy.result),
    [asset.stats.compliance],
  );

  return (
    <Link
      key={asset.id}
      href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/`}
    >
      <Card className="transition-all hover:bg-accent">
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-4">
              {asset.name}
              <div className="col-span-4">
                {failingControls.length > 0 ? (
                  <div className="flex flex-row items-center gap-2">
                    <Badge variant={"danger"}>
                      <ExclamationCircleIcon className="-ml-2 h-5 w-5 text-red-500" />
                      <span className="pl-2">
                        {failingControls.length}/{asset.stats.compliance.length}{" "}
                        controls are failing
                      </span>
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <Badge variant={"success"}>
                      <CheckBadgeIcon className="-ml-2 h-8 w-8 text-green-500" />
                      <span className="pl-2 text-sm">
                        All controls are passing
                      </span>
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                })}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link
                  className="!text-foreground hover:no-underline"
                  href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/settings`}
                >
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>
          <CardDescription>
            {Boolean(asset.description)
              ? asset.description
              : "No asset description..."}
          </CardDescription>
        </CardHeader>
        {/*<CardContent>
         <div className="grid grid-cols-4 gap-4">
            <div className={classNames("text-sm text-muted-foreground")}>
              <Badge className="mr-2 bg-red-700 text-white">
                {asset.stats.riskDistribution.critical ?? 0}
              </Badge>
              <span className="font-semibold">
                Critical severity vulnerabilities
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <Badge className="mr-2 bg-red-500 text-white">
                {asset.stats.riskDistribution.high ?? 0}
              </Badge>
              <span className="font-semibold">
                High severity vulnerabilities
              </span>
            </div>

            <div className={classNames("text-sm text-muted-foreground")}>
              <Badge className="mr-2 bg-orange-500 text-white">
                {asset.stats.riskDistribution.medium ?? 0}
              </Badge>
              <span className="font-semibold">
                Medium severity vulnerabilities
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              <Badge className="mr-2 bg-blue-500 text-white">
                {asset.stats.riskDistribution.low ?? 0}
              </Badge>
              <span className="font-semibold">
                Low severity vulnerabilities
              </span>
            </div>
          </div>
        </CardContent>
        */}
      </Card>
    </Link>
  );
};

export default AssetOverviewListItem;
