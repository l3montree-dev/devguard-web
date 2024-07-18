import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useAssetMenu } from "@/hooks/useAssetMenu";

import { useActiveProject } from "@/hooks/useActiveProject";

import Link from "next/link";

import { FunctionComponent, useEffect, useState } from "react";
import Page from "../../../../../../components/Page";

import { useActiveAsset } from "@/hooks/useActiveAsset";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { GetServerSidePropsContext } from "next";
import { Badge } from "@/components/ui/badge";
import { withOrganization } from "@/decorators/withOrganization";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index: FunctionComponent = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const router = useRouter();

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
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"secondary"}>Download SBOM</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Link
            download
            target="_blank"
            prefetch={false}
            href={router.asPath + `/sbom.json`}
            className="!text-foreground hover:no-underline"
          >
            <DropdownMenuItem>JSON-Format</DropdownMenuItem>
          </Link>
          <Link
            download
            target="_blank"
            prefetch={false}
            href={router.asPath + `/sbom.xml`}
            className="!text-foreground hover:no-underline"
          >
            <DropdownMenuItem>XML-Format</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </Page>
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
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
  },
);
