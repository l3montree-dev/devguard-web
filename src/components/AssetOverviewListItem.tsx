import Link from "next/link";
import React, { type FunctionComponent } from "react";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import type { AssetDTO } from "../types/api/api";
import Avatar from "./Avatar";
import ListItem from "./common/ListItem";
import Markdown from "./common/Markdown";
import { Badge } from "./ui/badge";

interface Props {
  asset: AssetDTO;
  projectSlug?: string;
}
const AssetOverviewListItem: FunctionComponent<Props> = ({
  asset,
  projectSlug: projectSlugProp,
}) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const projectSlug = projectSlugProp ?? project?.slug;

  return (
    <Link
      key={asset.id}
      href={`/${activeOrg.slug}/projects/${projectSlug}/assets/${asset.slug}/`}
    >
      <ListItem
        reactOnHover
        Description={
          <div className="flex flex-col">
            <span>
              <Markdown
                components={{
                  a: (props: React.ComponentPropsWithoutRef<"a">) => (
                    <span>{props.children}</span>
                  ),
                }}
              >
                {asset.description}
              </Markdown>
            </span>
          </div>
        }
        Title={
          <div className="flex flex-row items-center gap-2">
            <Avatar avatar={asset.avatar} name={asset.name} />
            {asset.name}
            {asset.state === "archived" && (
              <Badge variant={"outline"}>Archived</Badge>
            )}
            {asset.state === "deleted" && (
              <Badge variant={"destructive"}>Pending deletion</Badge>
            )}
          </div>
        }
      />
    </Link>
  );
};

export default AssetOverviewListItem;
