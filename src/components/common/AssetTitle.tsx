import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import ProjectTitle from "./ProjectTitle";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  return (
    <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
      <ProjectTitle />
      <span className="opacity-75 flex-shrink-0">/</span>
      <Link
        className="flex !text-white items-center gap-1 hover:no-underline min-w-0"
        href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependency-risks`}
        title={asset?.name}
      >
        <span className="truncate">{asset?.name}</span>
        <Badge className="!text-white" variant="outline">
          Repository
        </Badge>
      </Link>
    </span>
  );
};

export default AssetTitle;
