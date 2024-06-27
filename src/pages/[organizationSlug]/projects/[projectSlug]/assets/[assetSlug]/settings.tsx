import Page from "@/components/Page";
import AssetForm, {
  AssetFormGeneral,
  AssetFormMisc,
  AssetFormRequirements,
} from "@/components/asset/AssetForm";
import Section from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import {
  browserApiClient,
  getApiClientFromContext,
} from "@/services/flawFixApi";
import { AssetDTO, FlawWithCVE, Paged } from "@/types/api/api";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { FunctionComponent } from "react";
import { useForm } from "react-hook-form";

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

  const form = useForm<Partial<AssetDTO>>({ defaultValues: asset });

  const handleUpdate = async (data: Partial<AssetDTO>) => {
    const resp = await browserApiClient(
      "/organizations/" +
        activeOrg.slug +
        "/projects/" +
        project!.slug + // can never be null
        "/assets/" +
        asset.slug,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    if (!resp.ok) {
      console.error("Could not update asset");
    }
  };

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
          >
            {" "}
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Settings</span>
        </span>
      }
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)}>
            <Section title="General" description="General settings">
              <AssetFormGeneral form={form} />
            </Section>
            <Section
              title="Security Requirements"
              description="
Security requirements are specific criteria or conditions that an application, system, or organization must meet to ensure the protection of data, maintain integrity, confidentiality, and availability, and guard against threats and vulnerabilities. These requirements help to establish security policies, guide the development of secure systems, and ensure compliance with regulatory and industry standards."
            >
              <AssetFormRequirements form={form} />
            </Section>
            <Section title="Additional settings">
              <AssetFormMisc form={form} />
            </Section>
            <div className="mt-4 flex flex-row justify-end">
              <Button>Update</Button>
            </div>
          </form>
        </Form>
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
