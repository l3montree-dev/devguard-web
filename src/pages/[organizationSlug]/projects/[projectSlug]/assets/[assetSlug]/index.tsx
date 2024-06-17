import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import { useActiveProject } from "@/hooks/useActiveProject";

import Link from "next/link";

import { FunctionComponent, useEffect, useState } from "react";
import Page from "../../../../../../components/Page";

import { useActiveAsset } from "@/hooks/useActiveAsset";

const Index: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  useEffect(() => {});
  return (
    <Page
      Menu={assetMenu}
      title={"Risk Handling"}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg?.slug}`}
            className="text-white hover:no-underline"
          >
            {activeOrg?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}`}
          >
            {project?.name}
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Risk Handling</span>
        </span>
      }
    ></Page>
  );
};

export default Index;
