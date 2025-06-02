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

import CodeRiskScannerDialog from "../../../../../../components/CodeRiskScannerDialog";
import ListItem from "../../../../../../components/common/ListItem";
import DependencyRiskScannerDialog from "../../../../../../components/DependencyRiskScannerDialog";
import { Button } from "../../../../../../components/ui/button";
import { config } from "../../../../../../config";
import { useActiveAsset } from "../../../../../../hooks/useActiveAsset";
import {
  externalProviderIdToIntegrationName,
  providerIdToBaseURL,
} from "../../../../../../utils/externalProvider";
import Autosetup from "../../../../../../components/Autosetup";
import { useAutosetup } from "../../../../../../hooks/useAutosetup";

interface Props {
  apiUrl: string;
}

const Index: FunctionComponent<Props> = ({ apiUrl }) => {
  const assetMenu = useAssetMenu();
  const [isOpen, setIsOpen] = useState(false);
  const [dependencyRiskIsOpen, setDependencyRiskIsOpen] = useState(false);
  const asset = useActiveAsset();
  const autosetup = useAutosetup("full");
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
        description="Start scanning your code for vulnerabilities, license issues and policy violations."
        title="Welcome to DevGuard 🚀"
      >
        {asset?.externalEntityProviderId &&
          externalProviderIdToIntegrationName(
            asset.externalEntityProviderId,
          ) === "gitlab" && (
            <div className="mb-10">
              <div className="animated-outline rounded-lg">
                <Autosetup {...autosetup} />
              </div>
            </div>
          )}
        <div className="flex flex-col gap-4">
          <ListItem
            Title="Start by checking your dependencies for known vulnerabilities."
            Description={
              "Your application consists of up to 90% of the code from libraries like debian, maven, npm, go etc. Let's check, if we can find any libraries which are infected."
            }
            Button={
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setDependencyRiskIsOpen(true)}
                  variant={"default"}
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
    </Page>
  );
};
export default Index;

export const getServerSideProps = middleware(
  async (context: GetServerSidePropsContext, { asset }) => {
    const { organizationSlug, projectSlug, assetSlug, assetVersionSlug } =
      context.params!;

    // check if there exists a ref on the asset
    if (asset.refs.length > 0) {
      // redirect to the default ref
      let redirectTo = asset.refs.find((r) => r.defaultBranch);
      // if there is no default ref, redirect to the first one
      if (!redirectTo) {
        redirectTo = asset.refs[0];
      }
      return {
        redirect: {
          destination: `/${organizationSlug}/projects/${projectSlug}/assets/${assetSlug}/refs/${redirectTo.slug}`,
          permanent: false,
        },
      };
    }

    // there is no ref at all
    return {
      props: {
        apiUrl: config.devguardApiUrlPublicInternet,
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
