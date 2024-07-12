import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import { useActiveProject } from "@/hooks/useActiveProject";

import Link from "next/link";

import { FunctionComponent, useEffect, useState } from "react";
import Page from "../../../../../../components/Page";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { GetServerSidePropsContext } from "next";
import { Badge } from "@/components/ui/badge";

const Index: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();

  const assetMenu = useAssetMenu();
  const asset = useActiveAsset();

  return (
    <Page
      Menu={assetMenu}
      title={"Risk Handling"}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}`}
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
          >
            {activeOrg.name}{" "}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Organization
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex flex-row items-center gap-1 !text-white hover:no-underline"
            href={`/${activeOrg.slug}/projects/${project?.slug}`}
          >
            {project?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Project
            </Badge>
          </Link>
          <span className="opacity-75">/</span>
          <Link
            className="flex items-center gap-1 text-white hover:no-underline"
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}`}
          >
            {asset?.name}
            <Badge
              className="font-body font-normal !text-white"
              variant="outline"
            >
              Asset
            </Badge>
          </Link>
        </span>
      }
    ></Page>
  );
};

export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
