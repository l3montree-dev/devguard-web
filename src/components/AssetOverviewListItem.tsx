import Link from "next/link";
import { FunctionComponent, useMemo } from "react";
import { useActiveOrg } from "../hooks/useActiveOrg";
import { useActiveProject } from "../hooks/useActiveProject";
import { AssetDTO, PolicyEvaluation } from "../types/api/api";
import Avatar from "./Avatar";
import ListItem from "./common/ListItem";
import Markdown from "./common/Markdown";

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

  return (
    <Link
      key={asset.id}
      href={`/${activeOrg.slug}/projects/${project.slug}/assets/${asset.slug}/`}
    >
      <ListItem
        reactOnHover
        Description={
          <div className="flex flex-col">
            <span>
              <Markdown>{asset.description}</Markdown>
            </span>
          </div>
        }
        Title={
          <div className="flex flex-row items-center gap-2">
            <Avatar avatar={asset.avatar} name={asset.name} />
            {asset.name}
          </div>
        }
      />
    </Link>
  );
};

export default AssetOverviewListItem;
