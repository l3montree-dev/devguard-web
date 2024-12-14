import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  return (
    <span className="flex flex-row gap-2">
      <Link
        href={`/${activeOrg.slug}/projects`}
        className="flex flex-row items-center gap-1 !text-white hover:no-underline"
      >
        {activeOrg.name}{" "}
        <Badge className="font-body font-normal !text-white" variant="outline">
          Organization
        </Badge>
      </Link>
      <span className="opacity-75">/</span>
      <Link
        className="flex flex-row items-center gap-1 !text-white hover:no-underline"
        href={`/${activeOrg.slug}/projects/${project?.slug}/assets`}
      >
        {project?.name}
        <Badge className="font-body font-normal !text-white" variant="outline">
          Project
        </Badge>
      </Link>
      <span className="opacity-75">/</span>
      <Link
        className="flex items-center gap-1 text-white hover:no-underline"
        href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/risk-handling`}
      >
        {asset?.name}
        <Badge className="font-body font-normal !text-white" variant="outline">
          Asset
        </Badge>
      </Link>
    </span>
  );
};

export default AssetTitle;
