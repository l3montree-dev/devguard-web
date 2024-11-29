import Autosetup from "@/components/Autosetup";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import ContainerScanning from "@/components/risk-identification/ContainerScanningNode";
import DAST from "@/components/risk-identification/DASTNode";
import GitCommitSigning from "@/components/risk-identification/GitCommitSigning";
import GitCommitVerification from "@/components/risk-identification/GitCommitVerification";
import IaC from "@/components/risk-identification/IaCNode";
import ImageVerification from "@/components/risk-identification/ImageVerification";
import VerificationDialog from "@/components/risk-identification/ImageVerificationDialog";
import InTotoProvenance from "@/components/risk-identification/InTotoProvenance";
import SAST from "@/components/risk-identification/SASTNode";
import SCA from "@/components/risk-identification/SCANode";
import SecretScanning from "@/components/risk-identification/SecretScanningNode";
import SecureCodingGuidelines from "@/components/risk-identification/SecureCodingGuidelines";
import SigningNode from "@/components/risk-identification/SigningNode";
import { Badge } from "@/components/ui/badge";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withContentTree } from "@/decorators/withContentTree";
import { withOrganization } from "@/decorators/withOrganization";
import { withOrgs } from "@/decorators/withOrgs";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import { useAutosetup } from "@/hooks/useAutosetup";
import { getApiClientFromContext } from "@/services/devGuardApi";
import { AssetMetricsDTO } from "@/types/api/api";
import Image from "next/image";

import Link from "next/link";
import { FunctionComponent } from "react";

interface Props extends AssetMetricsDTO {}
const RiskIdentification: FunctionComponent<Props> = (
  props: AssetMetricsDTO,
) => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const menu = useAssetMenu();

  const { isLoading, handleAutosetup, progress, Loader } = useAutosetup("full");

  return (
    <Page
      Menu={menu}
      Title={
        <span className="flex flex-row gap-2">
          <Link
            href={`/${activeOrg.slug}/projects`}
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
            href={`/${activeOrg.slug}/projects/${project?.slug}/assets`}
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
            href={`/${activeOrg?.slug}/projects/${project?.slug}/assets/${asset?.slug}/risk-handling`}
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
      title="Security Control Center"
    >
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
              <GitCommitSigning />
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
            <div className="mb-10 grid grid-cols-3 gap-4">
              <GitCommitVerification />
              <SecretScanning />
              <SAST />
              <SCA />
              <IaC />
              <ContainerScanning />
              <DAST />
              <SigningNode />
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
