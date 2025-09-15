import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import WebhookSetupTicketIntegrationDialog from "@/components/guides/WebhookSetupTicketIntegrationDialog";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useRepositorySearch from "@/hooks/useRepositorySearch";
import "@xyflow/react/dist/style.css";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import Autosetup from "../../../../../../components/Autosetup";
import ListItem from "../../../../../../components/common/ListItem";
import RiskScannerDialog from "../../../../../../components/RiskScannerDialog";
import { Button } from "../../../../../../components/ui/button";

import { useActiveAsset } from "../../../../../../hooks/useActiveAsset";
import { useAutosetup } from "../../../../../../hooks/useAutosetup";
import { externalProviderIdToIntegrationName } from "../../../../../../utils/externalProvider";
import useConfig from "../../../../../../hooks/useConfig";

interface Props {
  repositories: Array<{ value: string; label: string }> | null;
}

const Index: FunctionComponent<Props> = ({ repositories }) => {
  const assetMenu = useAssetMenu();
  const [isOpen, setIsOpen] = useState(false);
  const [riskScanningIsOpen, setRiskScanningOpen] = useState(false);
  const [webhookIsOpen, setWebhookIsOpen] = useState(false);
  const asset = useActiveAsset();
  const config = useConfig();
  const autosetup = useAutosetup(config.devguardApiUrlPublicInternet, "full");

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
        {((asset?.externalEntityProviderId &&
          externalProviderIdToIntegrationName(
            asset.externalEntityProviderId,
          ) === "gitlab") ||
          asset?.repositoryProvider === "gitlab") && (
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
            Title="Check your Code for Risks 🛡️ (Vulnerabilities, Bad Practices, Leaked Secrets, and more...)"
            Description={
              "A typical applications code is made of 70-90% by dependencies (NPM, Go, maven, Debian, etc.). Let's check, if we can find any vulnerable dependencies. Another thing is your code — let's scan for any bad practices here, check that there are no secrets leaked, infrastructure is configured good and more."
            }
            Button={
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setRiskScanningOpen(true)}
                  variant={
                    asset?.externalEntityProviderId &&
                    externalProviderIdToIntegrationName(
                      asset.externalEntityProviderId,
                    ) === "gitlab"
                      ? "secondary"
                      : "default"
                  }
                >
                  Setup Risk Scanning
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
              "You can connect your Issue Tracker to DevGuard to automatically create issues for identified risks. You can handle findings directly from your issue tracker via slash commands. This way, you can easily track and mitigate vulnerabilities, bad-practices, license issues and more."
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
      <RiskScannerDialog
        open={riskScanningIsOpen}
        onOpenChange={setRiskScanningOpen}
        apiUrl={config.devguardApiUrlPublicInternet}
      />
      <WebhookSetupTicketIntegrationDialog
        open={webhookIsOpen}
        onOpenChange={setWebhookIsOpen}
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

    // there is no ref at all
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
    contentTree: withContentTree,
  },
);
