import Page from "@/components/Page";

import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";

import { FunctionComponent, useState } from "react";

import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import { withContentTree } from "@/decorators/withContentTree";

import Autosetup from "../../../../../../components/Autosetup";
import CodeRiskScannerDialog from "../../../../../../components/CodeRiskScannerDialog";
import ListItem from "../../../../../../components/common/ListItem";
import DependencyRiskScannerDialog from "../../../../../../components/DependencyRiskScannerDialog";
import { Button } from "../../../../../../components/ui/button";
import { config } from "../../../../../../config";
import { useActiveAsset } from "../../../../../../hooks/useActiveAsset";
import { useAutosetup } from "../../../../../../hooks/useAutosetup";
import { externalProviderIdToIntegrationName } from "../../../../../../utils/externalProvider";
import WebhookSetupTicketIntegrationDialog from "@/components/guides/WebhookSetupTicketIntegrationDialog";
import Image from "next/image";
import { getApiClientFromContext } from "@/services/devGuardApi";
import useRepositorySearch, { convertRepos } from "@/hooks/useRepositorySearch";

interface Props {
  apiUrl: string;
  repositories: Array<{ value: string; label: string }> | null;
}

const Index: FunctionComponent<Props> = ({ apiUrl, repositories }) => {
  const assetMenu = useAssetMenu();
  const [isOpen, setIsOpen] = useState(false);
  const [dependencyRiskIsOpen, setDependencyRiskIsOpen] = useState(false);
  const [webhookIsOpen, setWebhookIsOpen] = useState(false);
  const asset = useActiveAsset();
  const autosetup = useAutosetup("full");

  const { repos, searchLoading, handleSearchRepos } =
    useRepositorySearch(repositories);

  return (
    <Page
      Menu={assetMenu}
      title="Welcome to DevGuard!"
      description="Overview of the asset"
      Title={<AssetTitle />}
    >
      <Section
        primaryHeadline
        forceVertical
        description="Start scanning your code for vulnerabilities, bad-practices, license issues, policy violations and more."
        title="Welcome to DevGuard 🚀"
      >
        {asset?.externalEntityProviderId &&
          externalProviderIdToIntegrationName(
            asset.externalEntityProviderId,
          ) === "gitlab" && (
            <>
              <div className="mb-8">
                <div className="">
                  <Autosetup {...autosetup} />
                </div>
              </div>
              <hr className="mb-8" />
            </>
          )}
        <div className="flex flex-col gap-4 z-10">
          <ListItem
            Title="Start by checking your dependencies for known vulnerabilities."
            Description={
              "Your application consists of up to 90% of the code from libraries like debian, maven, npm, go etc. Let's check, if we can find any libraries which are infected."
            }
            Button={
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setDependencyRiskIsOpen(true)}
                  variant={"secondary"}
                >
                  Identify Dependency-Risks
                </Button>
              </div>
            }
          />
          <ListItem
            Title="Scan your own code for Bad-Practices, Secrets or Infrastructure-Configuration Issues."
            Description={
              "Your code is the most important part of your application. Let's check, if we can find any bad-practices, secrets or misconfigurations."
            }
            Button={
              <div className="flex flex-row gap-2">
                <Button onClick={() => setIsOpen(true)} variant={"secondary"}>
                  Identify Code-Risks
                </Button>
              </div>
            }
          />
        </div>
        <div>
          <ListItem
            Title={
              <span className="">
                Connect your Issue Tracker to DevGuard{" "}
                <Image
                  src="/assets/provider-icons/gitlab.svg"
                  width={50}
                  height={50}
                  alt="GitLab Logo"
                  className="inline-block ml-2 h-5 w-auto"
                />
                <Image
                  src="/assets/provider-icons/opencode.svg"
                  width={50}
                  height={50}
                  alt="GitLab Logo"
                  className="inline-block ml-2 h-4 w-auto"
                />
                <Image
                  src="/assets/provider-icons/github.svg"
                  width={50}
                  height={50}
                  alt="GitLab Logo"
                  className="inline-block ml-2 h-4 w-auto dark:invert"
                />
              </span>
            }
            Description={
              "Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            }
            Button={
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setWebhookIsOpen(true)}
                  variant={"secondary"}
                >
                  Setup Ticket-Integration
                </Button>
              </div>
            }
          />
        </div>
      </Section>
      <DependencyRiskScannerDialog
        open={dependencyRiskIsOpen}
        onOpenChange={setDependencyRiskIsOpen}
        apiUrl={apiUrl}
      />

      <CodeRiskScannerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        apiUrl={apiUrl}
      />

      <WebhookSetupTicketIntegrationDialog
        open={webhookIsOpen}
        onOpenChange={setWebhookIsOpen}
        repositories={repos}
      />
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { asset }) => {
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    // check if there is a path query parameter
    const path = context.query["path"];

    // check if there exists a ref on the asset
    if (asset.refs.length > 0) {
      // redirect to the default ref
      let redirectTo = asset.refs.find((r) => r.defaultBranch);
      // if there is no default ref, redirect to the first one
      if (!redirectTo) {
        redirectTo = asset.refs[0];
      }

      let destination = `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${redirectTo.slug}`;

      if (path) {
        destination += path;
      }

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    const apiClient = getApiClientFromContext(context);

    const [repoResp] = await Promise.all([
      apiClient(
        "/organizations/" + organizationSlug + "/integrations/repositories",
      ),
    ]);

    let repos: Array<{ value: string; label: string }> | null = null;
    if (repoResp.ok) {
      repos = convertRepos(await repoResp.json());
    }

    // there is no ref at all
    return {
      props: {
        apiUrl: config.devguardApiUrlPublicInternet,
        repositories: repos,
      },
    };
  },
  {
    session: withSession,
    organizations: withOrgs,
    organization: withOrganization,
    project: withProject,
    asset: withAsset,
    contentTree: withContentTree,
  },
);
