import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import { ProjectElement } from "./ProjectTitle";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  return (
    <span className="flex flex-row gap-2">
      <span className="opacity-75">/</span>
      <ProjectElement project={project} activeOrg={activeOrg} />
      <span className="opacity-75">/</span>
      <Link
        className="flex items-center gap-1 text-white hover:no-underline"
        href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersion?.slug}/dependency-risks`}
      >
        {asset?.name}
        <Badge className="!text-white" variant="outline">
          Repository
        </Badge>
      </Link>
    </span>
  );
};

export default AssetTitle;
