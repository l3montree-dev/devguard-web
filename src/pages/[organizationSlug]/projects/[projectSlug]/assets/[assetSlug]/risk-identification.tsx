import Page from "@/components/Page";
import ContainerScanning from "@/components/risk-identification/ContainerScanningNode";
import DAST from "@/components/risk-identification/DASTNode";
import IaC from "@/components/risk-identification/IaCNode";
import SAST from "@/components/risk-identification/SASTNode";
import SCA from "@/components/risk-identification/SCANode";
import SecretScanning from "@/components/risk-identification/SecretScanningNode";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/const/viewConstants";
import { middleware } from "@/decorators/middleware";
import { withAsset } from "@/decorators/withAsset";
import { withOrg } from "@/decorators/withOrg";
import { withProject } from "@/decorators/withProject";
import { withSession } from "@/decorators/withSession";
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useAssetMenu } from "@/hooks/useAssetMenu";
import useDimensions from "@/hooks/useDimensions";
import { getApiClientFromContext } from "@/services/flawFixApi";
import Link from "next/link";
import { useRouter } from "next/router";
import ReactFlow, { Edge } from "reactflow";
import "reactflow/dist/style.css";

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
      fullscreen
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
            {asset?.name}
          </Link>
          <span className="opacity-75">/</span>
          <span>Risk Identification</span>
        </span>
      }
      title="Risk Identification"
    >
      <div className="border-b bg-card px-10 pb-5 pt-5">
        <h2 className="text-xl font-medium text-foreground">
          Risk Identification using the OWASP DevSecOps-Pipeline
        </h2>

        <p className="mt-2  text-muted-foreground">
          The OWASP DevSecOps Pipeline is a reference architecture for
          integrating security into a DevOps Pipeline. It is a set of security
          controls that can be integrated into a CI/CD pipeline to automate
          security testing.
        </p>
      </div>
      <div
        style={{
          width: dimensions.width - SIDEBAR_WIDTH,
          height: dimensions.height - HEADER_HEIGHT - 85,
        }}
      >
        <ReactFlow
          disableKeyboardA11y
          maxZoom={1}
          minZoom={1}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
        />
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
    organizations: withOrg,
    project: withProject,
    asset: withAsset,
  },
);
