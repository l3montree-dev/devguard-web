import Autosetup from "@/components/Autosetup";
import Section from "@/components/common/Section";
import Page from "@/components/Page";
import ContainerScanning from "@/components/risk-identification/ContainerScanningNode";
import DAST from "@/components/risk-identification/DASTNode";
import IaC from "@/components/risk-identification/IaCNode";
import SAST from "@/components/risk-identification/SASTNode";
import SCA from "@/components/risk-identification/SCANode";
import SecretScanning from "@/components/risk-identification/SecretScanningNode";
import { Badge } from "@/components/ui/badge";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
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
      title="Risk Identification"
    >
      <Section
        primaryHeadline
        description="The OWASP DevSecOps Pipeline is a reference architecture for
            integrating security into a DevOps Pipeline. It is a set of security
            controls that can be integrated into a CI/CD pipeline to automate
            security testing."
        title="Risk Identification using the OWASP DevSecOps-Pipeline"
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
        <div className="grid grid-cols-3 gap-4">
          <SecretScanning />
          <SAST />

          <SCA />
          <IaC />
          <ContainerScanning />
          <DAST />
        </div>
      </Section>
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
  },
);
