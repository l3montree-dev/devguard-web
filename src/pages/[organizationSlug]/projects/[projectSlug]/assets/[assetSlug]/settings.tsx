import Page from "@/components/Page";
import { toast } from "@/components/Toaster";
import Button from "@/components/common/Button";
import SecRequirementDialog from "@/components/common/SecRequirementDialog";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/flawFixApi";
import {
  AssetDTO,
  EnvDTO,
  FlawWithCVE,
  Paged,
  ProjectDTO,
} from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import router from "next/router";
import { FunctionComponent } from "react";

interface Props {
  asset: AssetDTO;
  flaws: Paged<FlawWithCVE>;
}
const Index: FunctionComponent<Props> = ({
  asset,
  flaws,
}: {
  asset: AssetDTO;
  flaws: Paged<FlawWithCVE>;
}) => {
  const activeOrg = useActiveOrg();
  const assetMenu = useAssetMenu();
  const project = useActiveProject();

  return (
    <Page
      Menu={assetMenu}
      title="Asset Settings"
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
          ></Link>
          <span className="opacity-75">/</span>
          <span>Settings</span>
        </span>
      }
    >
      <div>
        <SecRequirementDialog
          Button={
            <Button intent="primary" variant="outline">
              Eigene Gegebenheiten (Schutzbedarf)
            </Button>
          }
          asset={asset}
        />
      </div>
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

    const filterQuery = Object.entries(context.query).filter(
      ([k]) => k.startsWith("filterQuery[") || k.startsWith("sort["),
    );

    // check for page and page size query params
    // if they are there, append them to the uri
    const page = (context.query.page as string) ?? "1";
    const pageSize = (context.query.pageSize as string) ?? "25";
    const [resp, flawResp] = await Promise.all([
      apiClient(uri),
      apiClient(
        uri +
          "flaws/?" +
          new URLSearchParams({
            page,
            pageSize,
            ...Object.fromEntries(filterQuery),
          }),
      ),
    ]);

    // fetch a personal access token from the user

    const [asset, flaws] = await Promise.all([resp.json(), flawResp.json()]);
    console.log("Asset:", asset, "flaw:", flaws.data);
    //console.log("flaw:", flaws.data);
    //console.log("Asset:", asset);

    return {
      props: {
        asset,
        flaws,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
