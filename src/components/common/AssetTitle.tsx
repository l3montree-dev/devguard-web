import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useActiveAssetVersion } from "@/hooks/useActiveAssetVersion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import ProjectTitle from "./ProjectTitle";
import useDecodedParams from "@/hooks/useDecodedParams";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;
  const asset = useActiveAsset();
  const assetVersion = useActiveAssetVersion();

  const params = useDecodedParams() as { assetVersionSlug?: string };

  const [assetVersionSlug, setAssetVersionSlug] = useState<string | undefined>(
    () => localStorage.getItem("lastViewedAssetVersionSlug") || undefined,
  );

  useEffect(() => {
    const currentSlug = assetVersion?.slug ?? params?.assetVersionSlug;

    if (currentSlug) {
      localStorage.setItem("lastViewedAssetVersionSlug", currentSlug);
      setAssetVersionSlug(currentSlug);
    }
  }, [assetVersion?.slug, params?.assetVersionSlug]);
  return (
    <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
      <ProjectTitle />
      <span className="opacity-75 flex-shrink-0">/</span>
      <Link
        className="flex !text-header-foreground items-center gap-1 hover:no-underline min-w-0"
        href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/refs/${assetVersionSlug}`}
        title={asset?.name}
      >
        <span className="truncate">{asset?.name}</span>
        <Badge className="!text-header-foreground" variant="outline">
          Repository
        </Badge>
      </Link>
    </span>
  );
};

export default AssetTitle;
