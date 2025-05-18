import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { AssetDTO, PolicyEvaluation } from "../types/api/api";
import ListItem from "./common/ListItem";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  asset: AssetDTO & {
    stats: {
      compliance: Array<PolicyEvaluation>;
    };
  };
}
const AssetOverviewListItem: FunctionComponent<Props> = ({ asset }) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const failingControls = useMemo(
    () => asset.stats.compliance.filter((policy) => !policy.compliant),
    [asset.stats.compliance],
  );

  return (
    <Link
      key={asset.id}
      href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/`}
    >
      <ListItem
        reactOnHover
        Description={
          <div className="flex flex-col">
            <span>{asset.description}</span>
            {asset.stats.compliance.length > 0 ? (
              failingControls.length > 0 ? (
                <div className="mt-4 flex flex-row items-center gap-2">
                  <Badge variant={"secondary"}>
                    <ExclamationCircleIcon className="-ml-2 h-5 w-5 text-muted-foreground" />
                    <span className="pl-2">
                      {failingControls.length}/{asset.stats.compliance.length}{" "}
                      controls are failing
                    </span>
                  </Badge>
                </div>
              ) : (
                <div className="mt-4 flex flex-row items-center gap-2">
                  <Badge variant={"success"}>
                    <CheckBadgeIcon className="-ml-2 h-5 w-5 text-green-500" />
                    <span className="pl-2 ">All controls are passing</span>
                  </Badge>
                </div>
              )
            ) : null}
          </div>
        }
        Button={
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
        }
        Title={
          <div className="flex flex-row items-center gap-4">{asset.name}</div>
        }
      />
    </Link>
  );
};

export default AssetOverviewListItem;
