import Autosetup from "@/components/Autosetup";
import AssetTitle from "@/components/common/AssetTitle";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import ContainerScanning from "@/components/risk-identification/ContainerScanningNode";
import DAST from "@/components/risk-identification/DASTNode";
import IaC from "@/components/risk-identification/IaCNode";
import ImageVerification from "@/components/risk-identification/ImageVerification";
import InTotoProvenance from "@/components/risk-identification/InTotoProvenance";
import SAST from "@/components/risk-identification/SASTNode";
import SCA from "@/components/risk-identification/SCANode";
import SecretScanning from "@/components/risk-identification/SecretScanningNode";
import SecureCodingGuidelines from "@/components/risk-identification/SecureCodingGuidelines";
import SigningNode from "@/components/risk-identification/SigningNode";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useAutosetup } from "@/hooks/useAutosetup";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { AssetMetricsDTO, PatWithPrivKey } from "@/types/api/api";
import { Tab } from "@headlessui/react";
import Image from "next/image";
import { FunctionComponent } from "react";
import CopyCode from "../../../../../../components/common/CopyCode";
import CustomTab from "../../../../../../components/common/CustomTab";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import { useActiveProject } from "../../../../../../hooks/useActiveProject";
import usePersonalAccessToken from "../../../../../../hooks/usePersonalAccessToken";
import { Button } from "../../../../../../components/ui/button";
import Steps from "../../../../../../components/risk-identification/Steps";
import Link from "next/link";

interface Props extends AssetMetricsDTO {}
const RiskIdentification: FunctionComponent<Props> = (
  props: AssetMetricsDTO,
) => {
  const asset = useActiveAsset();
  const project = useActiveProject();
  const org = useActiveOrg();

  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();
  const pat = (
    personalAccessTokens.length > 0 ? personalAccessTokens[0] : null
  ) as PatWithPrivKey | null;
  const menu = useAssetMenu();

  const { isLoading, handleAutosetup, progress, Loader } = useAutosetup("full");

  return (
    <Page Menu={menu} Title={<AssetTitle />} title="Security Control Center">
      <div className="flex flex-row">
        <div className="flex-1">
          <Section
            primaryHeadline
            description="The Security Control Center provides you with a set of tools to secure your project. The tools are designed to be used in a DevOps environment and are integrated into your CI/CD pipeline. The Workflow is based on proven security practices and is designed to be easy to use."
            title="Security Control Center for DevSecOps"
            forceVertical
          >
            {asset?.repositoryId?.startsWith("gitlab:") && (
              <div className="mb-0">
                <Autosetup
                  isLoading={isLoading}
                  handleAutosetup={handleAutosetup}
                  progress={progress}
                  Loader={Loader}
                />
                <div className="my-8 flex flex-row items-center text-center text-muted-foreground">
                  <div className="flex-1 border-t-2 border-dotted" />
                  <span className="px-5">OR</span>
                  <div className="flex-1 border-t-2 border-dotted" />
                </div>
              </div>
            )}
            <h3 id="continous-integration" className="text-xl font-semibold">
              Development{" "}
              <Image
                className="mr-2 inline-block"
                src={"/assets/git.svg"}
                alt="Git logo"
                width={30}
                height={30}
              />
              <Image
                className="mr-2 inline-block"
                src={"/assets/intoto.png"}
                alt="InToto logo"
                width={30}
                height={30}
              />
            </h3>
            <div className="mb-10 grid grid-cols-3 gap-4">
              <SecureCodingGuidelines />
              <InTotoProvenance />
            </div>
            <h3 id="continous-integration" className="text-xl font-semibold">
              Continous Integration{" "}
              <Image
                className="mr-1 inline-block"
                src={"/assets/gitlab.svg"}
                alt="GitLab logo"
                width={30}
                height={30}
              />{" "}
              <Image
                className="mr-2 inline-block dark:invert"
                src={"/assets/github.svg"}
                alt="GitHub logo"
                width={30}
                height={30}
              />
              <Image
                className="mr-2 inline-block"
                src={"/assets/intoto.png"}
                alt="InToto logo"
                width={30}
                height={30}
              />
            </h3>
            <div className="mb-10">
              <Tab.Group>
                <Tab.List>
                  <CustomTab>
                    Integrate a whole DevSecOps-Pipeline with a single Workflow
                  </CustomTab>
                  <CustomTab>
                    Integrate each part of the Pipeline Step-by-Step
                  </CustomTab>
                </Tab.List>
                <Tab.Panel className={"mt-4"}>
                  <Steps>
                    <Section
                      className="mb-10 mt-0 pb-0 pt-0"
                      description="To use the Devguard-Scanner, you need to create a Personal Access
              Token. You can create such a token by clicking the button below."
                      title="Create a Personal Access Token"
                      forceVertical
                    >
                      {pat && (
                        <div className="flex flex-row items-center justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-row gap-2">
                              <CopyCode
                                language="shell"
                                codeString={pat?.privKey}
                              />
                            </div>

                            <span className=" block text-right text-sm text-destructive">
                              Make sure to copy the token. You won&apos;t be
                              able to see it ever again!
                            </span>
                          </div>
                        </div>
                      )}
                      {!pat && (
                        <div>
                          <Button
                            variant={"default"}
                            onClick={() =>
                              onCreatePat({ description: "SCA Analysis" })
                            }
                          >
                            Create Personal Access Token
                          </Button>
                        </div>
                      )}
                    </Section>
                    <Section
                      forceVertical
                      className="mb-10"
                      title="Store the Token in your CI/CD Variables"
                    >
                      <p className="text-sm text-muted-foreground">
                        To use the DevGuard-Scanner in your CI/CD pipeline, you
                        need to store the token in your CI/CD variables. The
                        token is used to authenticate the scanner with the
                        DevGuard API:{" "}
                        <Link
                          target="_blank"
                          href="https://docs.gitlab.com/ee/ci/variables/"
                        >
                          GitLab Documentation
                        </Link>
                        {", "}
                        <Link href="https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables">
                          GitHub Documentation
                        </Link>
                      </p>
                    </Section>
                    <Section
                      className="mt-0"
                      forceVertical
                      title="Integrate the DevGuard-Scanner"
                    >
                      <Tab.Group>
                        <Tab.List>
                          <CustomTab>
                            {" "}
                            <Image
                              className="mr-1 inline-block"
                              src={"/assets/gitlab.svg"}
                              alt="GitLab logo"
                              width={20}
                              height={20}
                            />{" "}
                            GitLab
                          </CustomTab>
                          <CustomTab>
                            <Image
                              className="mr-2 inline-block dark:invert"
                              src={"/assets/github.svg"}
                              alt="GitHub logo"
                              width={20}
                              height={20}
                            />{" "}
                            GitHub
                          </CustomTab>
                        </Tab.List>
                        <Tab.Panel className={"my-3"}>
                          <CopyCode
                            language="yaml"
                            codeString={`# .gitlab-ci.yml

include:
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/full.yml"
  inputs:
    asset_name: ${org.slug + "/projects/" + project?.slug + "/assets/" + asset?.slug}
    token: "$DEVGUARD_TOKEN"`}
                          />
                        </Tab.Panel>
                        <Tab.Panel className={"my-3"}>
                          <CopyCode
                            language="yaml"
                            codeString={`# .github/workflows/devguard.yml
name: DevGuard Workflow

on:
  push:
 
jobs:
  devguard-scanner:
    uses: l3montree-dev/devguard-action/.github/workflows/full.yml@main
    with:
        asset-name: "${org.slug + "/projects/" + project?.slug + "/assets/" + asset?.slug}"
    secrets:
        devguard-token: \$\{\{ secrets.DEVGUARD_TOKEN }} `}
                          />
                        </Tab.Panel>
                      </Tab.Group>
                    </Section>
                  </Steps>
                </Tab.Panel>

                <Tab.Panel className={"mt-4"}>
                  <div className="grid grid-cols-3 gap-4">
                    <SecretScanning />
                    <SAST />
                    <SCA />
                    <IaC />
                    <ContainerScanning />
                    <DAST />
                    <SigningNode />
                  </div>
                </Tab.Panel>
              </Tab.Group>
            </div>
            <h3 id="operations" className="text-xl font-semibold">
              Operations{" "}
              <Image
                className="mr-2 inline-block"
                src={"/assets/kubernetes.svg"}
                alt="Kubernetes logo"
                width={30}
                height={30}
              />
              <Image
                className="mr-2 inline-block"
                src={"/assets/helm.svg"}
                alt="Helm logo"
                width={30}
                height={30}
              />
              <Image
                className="mr-2 inline-block"
                src={"/assets/intoto.png"}
                alt="InToto logo"
                width={30}
                height={30}
              />
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <ImageVerification />
            </div>
          </Section>
        </div>
      </div>
    </Page>
  );
};

export default RiskIdentification;

export const getServerSideProps = middleware(
  async (context) => {
    // fetch the project
    const { organizationSlug, projectSlug, assetSlug } = context.params!;

    const apiClient = getApiClientFromContext(context);
    const metrics =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/metrics";

    const resp = await apiClient(metrics);
    const data = await resp.json();

    return {
      props: {
        ...data,
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
