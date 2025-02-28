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
import { AssetMetricsDTO, PatWithPrivKey } from "@/types/api/api";
import { Tab } from "@headlessui/react";

import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useRef, useState } from "react";
import CopyCode from "../../../../../../components/common/CopyCode";
import CustomTab from "../../../../../../components/common/CustomTab";
import Stage from "../../../../../../components/risk-identification/Stage";
import Steps from "../../../../../../components/risk-identification/Steps";
import { Button } from "../../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../../../components/ui/dialog";
import { useActiveOrg } from "../../../../../../hooks/useActiveOrg";
import { useActiveProject } from "../../../../../../hooks/useActiveProject";
import usePersonalAccessToken from "../../../../../../hooks/usePersonalAccessToken";

import React from "react";
import UploadSbomDialog from "@/components/risk-identification/UploadSbomDialog";

import GitlabInstructionsSteps from "@/components/risk-identification/GitlabInstructionsSteps";
import GithubInstructionsSteps from "@/components/risk-identification/GithubInstructionsSteps";
import { useStore } from "@/zustand/globalStoreProvider";
interface Props extends AssetMetricsDTO {}

const SecurityControlCenter: FunctionComponent<Props> = () => {
  const asset = useActiveAsset();

  const apiUrl = useStore((s) => s.apiUrl);

  const menu = useAssetMenu();

  const project = useActiveProject();
  const org = useActiveOrg();
  const [fullIntegrationOpen, setFullIntegrationOpen] = useState(false);
  const [sbomIntegrationOpen, setSbomIntegrationOpen] = useState(false);
  const { personalAccessTokens, onCreatePat } = usePersonalAccessToken();
  const pat = (
    personalAccessTokens.length > 0 ? personalAccessTokens[0] : null
  ) as PatWithPrivKey | undefined;

  const { isLoading, handleAutosetup, progress, Loader } = useAutosetup("full");

  return (
    <>
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

              <h3 className="text-xl font-semibold">
                <div className="mb-4">
                  <Stage
                    id="Manual-SBOM-Scan"
                    title="Manual SBOM Scan"
                    description="Manually scan uploaded CycloneDX JSON files for component and vulnerability analysis."
                    buttonTitle="Scan"
                    buttonVariant="default"
                    onButtonClick={() => setSbomIntegrationOpen(true)}
                  />
                </div>

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
              <h3 className="text-xl font-semibold">
                Integrating DevGuard into your CI/CD-Pipeline{" "}
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
                <div className="mb-4">
                  <Stage
                    id="devsecops-pipeline"
                    title="DevSecOps-Pipeline"
                    description="Integrate the whole DevSecOps-Pipeline with a single CI/CD-Component. This includes Security-Scans, Artifact Signing and Build-Provenance generation"
                    buttonTitle="Integrate the CI/CD-Pipeline for automated Security-Scans"
                    buttonVariant="default"
                    onButtonClick={() => setFullIntegrationOpen(true)}
                  />
                </div>
                <div className="flex w-full flex-row items-center py-2">
                  <div className="flex-1 border-t" />
                  <span className="mx-10 inline-block text-center text-sm text-muted-foreground">
                    OR integrate each step manually (improved flexibility)
                  </span>
                  <div className="flex-1 border-t" />
                </div>
                <div className="grid grid-cols-3 gap-4 opacity-50 transition-all hover:opacity-100">
                  <SecretScanning />
                  <SAST />
                  <SCA />
                  <IaC />
                  <ContainerScanning />
                  <DAST />
                  <SigningNode />
                </div>
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
        <div>
          <Dialog
            open={sbomIntegrationOpen}
            onOpenChange={setSbomIntegrationOpen}
          >
            <DialogContent>
              <UploadSbomDialog />
            </DialogContent>
          </Dialog>
        </div>
      </Page>
      <Dialog open={fullIntegrationOpen} onOpenChange={setFullIntegrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full DevSecOps Integration</DialogTitle>
            <DialogDescription>
              Integrate the whole DevSecOps-Pipeline with a single
              CI/CD-Component. This includes Security-Scans, Artifact Signing
              and Build-Provenance generation
            </DialogDescription>
          </DialogHeader>
          <hr />
          <div>
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
                      <CopyCode language="shell" codeString={pat?.privKey} />
                    </div>

                    <span className=" block text-right text-sm text-destructive">
                      Make sure to copy the token. You won&apos;t be able to see
                      it ever again!
                    </span>
                  </div>
                </div>
              )}
              {!pat && (
                <div>
                  <Button
                    variant={"default"}
                    onClick={() => onCreatePat({ description: "SCA Analysis" })}
                  >
                    Create Personal Access Token
                  </Button>
                </div>
              )}
            </Section>
          </div>
          <hr />
          <Tab.Group>
            <Tab.List>
              <CustomTab>
                <Image
                  src="/assets/github.svg"
                  width={20}
                  className="mr-2 inline dark:invert"
                  height={20}
                  alt="GitHub"
                />
                Using GitHub Actions
              </CustomTab>
              <CustomTab>
                <Image
                  src="/assets/gitlab.svg"
                  width={20}
                  className="mr-2 inline"
                  height={20}
                  alt="GitLab"
                />
                Using GitLab CI/CD
              </CustomTab>
              {/*               <CustomTab>
                <Image
                  src="/assets/docker.svg"
                  width={20}
                  className="mr-2 inline"
                  height={20}
                  alt="Docker Logo"
                />
                Using Docker
              </CustomTab> */}
            </Tab.List>
            <Tab.Panels className={"mt-2"}>
              <Tab.Panel>
                <GithubInstructionsSteps
                  pat={pat}
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
              <Tab.Panel>
                <GitlabInstructionsSteps
                  isLoading={isLoading}
                  handleAutosetup={handleAutosetup}
                  progress={progress}
                  Loader={Loader}
                  pat={pat}
                  codeString={`# .gitlab-ci.yml

include:
- remote: "https://gitlab.com/l3montree/devguard/-/raw/main/templates/full.yml"
  inputs:
    asset_name: ${org.slug + "/projects/" + project?.slug + "/assets/" + asset?.slug}
    token: "$DEVGUARD_TOKEN"
    api_url: ${apiUrl}
    `}
                  apiUrl={apiUrl}
                />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityControlCenter;

export const getServerSideProps = middleware(
  async (context) => {
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
