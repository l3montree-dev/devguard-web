"use client";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import useDecodedParams from "@/hooks/useDecodedParams";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import ProjectTitle from "./ProjectTitle";
import { eventBus } from "@/events";

const AssetTitle = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject()!;
  const asset = useActiveAsset();

  const params = useDecodedParams() as { assetVersionSlug?: string };

  const [assetVersionSlug, setAssetVersionSlug] = useState<string>();

  useEffect(() => {
    const currentSlug = params?.assetVersionSlug;

    if (currentSlug) {
      localStorage.setItem(
        "lastViewedAssetVersionSlug" + asset?.slug,
        currentSlug,
      );
      setAssetVersionSlug(currentSlug);
    } else {
      const stored = localStorage.getItem(
        "lastViewedAssetVersionSlug" + asset?.slug,
      );
      setAssetVersionSlug(stored && stored !== "undefined" ? stored : "");
    }
  }, [params?.assetVersionSlug, asset?.slug]);

  useEffect(() => {
    eventBus.subscribe("assetTitleListener", "assetVersionDeleted", () => {
      const stored = localStorage.getItem(
        "lastViewedAssetVersionSlug" + asset?.slug,
      );
      setAssetVersionSlug(stored && stored !== "undefined" ? stored : "");
    });

    return () => {
      eventBus.unsubscribe("assetTitleListener");
    };
  }, [asset?.slug]);

  return (
    <span className="flex flex-row gap-2 min-w-0 overflow-hidden">
      <ProjectTitle />
      <span className="opacity-75 flex-shrink-0">/</span>
      <Link
        className="flex !text-header-foreground items-center gap-1 hover:no-underline min-w-0"
        href={
          `/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}` +
          (assetVersionSlug && assetVersionSlug !== "undefined"
            ? `/refs/${assetVersionSlug}`
            : "")
        }
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
