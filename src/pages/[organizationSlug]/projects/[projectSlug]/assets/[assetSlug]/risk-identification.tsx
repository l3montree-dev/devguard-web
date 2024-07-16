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
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/devGuardApi";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactFlow, Edge } from "@xyflow/react";
import "@xyflow/react/dist/base.css";

const paddingX = 35;
const paddingY = 55;

const width = 325;
const nodes = [
  {
    id: "node-1",
    type: "secretScanning",
    position: { x: paddingX, y: paddingY },
    data: { value: 123 },
  },
  {
    id: "node-2",
    type: "sca",
    position: { x: paddingX + width, y: paddingY },
    data: { value: 456 },
  },
  {
    id: "node-3",
    type: "sast",
    position: { x: paddingX + width * 2, y: paddingY },
    data: { value: 789 },
  },
  {
    id: "node-4",
    type: "iac",
    position: { x: paddingX + 3 * width, y: paddingY },
    data: { value: 101 },
  },
  {
    id: "node-5",
    type: "containerScanning",
    position: { x: paddingX + 4 * width, y: paddingY },
    data: { value: 101 },
  },
  {
    id: "node-6",
    type: "dast",
    position: { x: paddingX + 5 * width, y: paddingY },
    data: { value: 101 },
  },
];
const edges: Array<Edge<any>> = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    sourceHandle: "right",
    targetHandle: "left",
    style: {
      strokeWidth: "2",
    },
  },
  {
    id: "edge-2",
    source: "node-2",
    target: "node-3",
    sourceHandle: "right",
    targetHandle: "left",
    style: {
      strokeWidth: "2",
    },
  },
  {
    id: "edge-3",
    source: "node-3",
    target: "node-4",
    sourceHandle: "right",
    targetHandle: "left",
    style: {
      strokeWidth: "2",
    },
  },
  {
    id: "edge-4",
    source: "node-4",
    target: "node-5",
    sourceHandle: "right",
    targetHandle: "left",
    style: {
      strokeWidth: "2",
    },
  },
  {
    id: "edge-5",
    source: "node-5",
    target: "node-6",
    sourceHandle: "right",
    targetHandle: "left",
    style: {
      strokeWidth: "2",
    },
  },
];

const nodeTypes = {
  secretScanning: SecretScanning,
  sca: SCA,
  sast: SAST,
  iac: IaC,
  containerScanning: ContainerScanning,
  dast: DAST,
};

const RiskIdentification = () => {
  const activeOrg = useActiveOrg();
  const project = useActiveProject();
  const asset = useActiveAsset();

  const router = useRouter();
  const menu = useAssetMenu();
  const dimensions = useDimensions();
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
        description="The OWASP DevSecOps Pipeline is a reference architecture for
            integrating security into a DevOps Pipeline. It is a set of security
            controls that can be integrated into a CI/CD pipeline to automate
            security testing."
        title="Risk Identification using the OWASP DevSecOps-Pipeline"
        forceVertical
      >
        <div
          className="overflow-hidden rounded-lg border bg-white dark:bg-black"
          style={{
            width: "100%",
            height: dimensions.height / 2,
          }}
        >
          <ReactFlow
            disableKeyboardA11y
            defaultViewport={{
              zoom: 0.9,
              x: 0,
              y: 0,
            }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
          />
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
    const uri =
      "/organizations/" +
      organizationSlug +
      "/projects/" +
      projectSlug +
      "/assets/" +
      assetSlug +
      "/";

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
