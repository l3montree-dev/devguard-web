import Page from "@/components/Page";
import { SIDEBAR_WIDTH, HEADER_HEIGHT } from "@/const/viewConstants";
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
import "reactflow/dist/style.css";

import Link from "next/link";
import { useRouter } from "next/router";
import ReactFlow, { Edge, Handle, Position } from "reactflow";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import { classNames } from "@/utils/common";
import Modal from "@/components/common/Modal";
import { useState } from "react";

const handleStyle = { left: 10 };

function Stage({
  title,
  description,
  sourceHandle,
  targetHandle,
  onButtonClick,
  comingSoon,
}: {
  title: string;
  description: string;
  sourceHandle?: boolean;
  targetHandle?: boolean;
  comingSoon?: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <div
      className={classNames(
        "flex w-60 items-center justify-between gap-x-6 rounded-lg border bg-white px-5 py-5 text-sm shadow-sm   transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-white",
        comingSoon ? "opacity-60" : "scale-105 ring-1 ring-blue-500",
      )}
    >
      {targetHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="target"
          id="left"
          position={Position.Left}
        />
      )}
      <div>
        <div>
          <span className="font-semibold">{title}</span>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>
        <div className="mt-10 flex flex-row">
          <Button
            className="flex-1"
            disabled={comingSoon}
            intent="primary"
            variant="outline"
            onClick={onButtonClick}
          >
            {comingSoon ? "Coming soon" : "Open Instructions"}
          </Button>
        </div>
      </div>
      {sourceHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="source"
          id="right"
          position={Position.Right}
        />
      )}
    </div>
  );
}

function SecretScanning({ data }) {
  return (
    <Stage
      title="Secret Scanning"
      description="Scan git repositories for finding potential credentials leakage."
      sourceHandle
      comingSoon
    />
  );
}

function SCA() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Stage
        title="Software Composition Analysis"
        description="Find known vulnerabilities in third-party and open source dependencies."
        sourceHandle
        targetHandle
        onButtonClick={() => setOpen(true)}
      />
      <Modal
        title="Software Composition Analysis"
        open={open}
        setOpen={setOpen}
      ></Modal>
    </>
  );
}

function SAST({ data }) {
  return (
    <Stage
      title="Static Application Security Testing"
      description="Find security vulnerabilities in produced source code."
      sourceHandle
      targetHandle
      comingSoon
    />
  );
}

function IaC({ data }) {
  return (
    <Stage
      title="Infrastructure as Code"
      description="Find security vulnerabilities in infrastructure code like Dockerfiles, Terraform, etc."
      sourceHandle
      targetHandle
      comingSoon
    />
  );
}

function ContainerScanning({ data }) {
  return (
    <Stage
      title="Container Scanning"
      description="Find known security vulnerabilities in OCI images, like Docker Images."
      sourceHandle
      targetHandle
      comingSoon
    />
  );
}

function DAST({ data }) {
  return (
    <Stage
      title="Dynamic Application Security Testing"
      description="Find security vulnerabilities in running applications."
      targetHandle
      comingSoon
    />
  );
}

const paddingX = 35;
const paddingY = 55;

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
    position: { x: paddingX + 275, y: paddingY },
    data: { value: 456 },
  },
  {
    id: "node-3",
    type: "sast",
    position: { x: paddingX + 275 * 2, y: paddingY },
    data: { value: 789 },
  },
  {
    id: "node-4",
    type: "iac",
    position: { x: paddingX + 3 * 275, y: paddingY },
    data: { value: 101 },
  },
  {
    id: "node-5",
    type: "containerScanning",
    position: { x: paddingX + 4 * 275, y: paddingY },
    data: { value: 101 },
  },
  {
    id: "node-6",
    type: "dast",
    position: { x: paddingX + 5 * 275, y: paddingY },
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
      <div className="border-b bg-white px-10 pb-5 pt-5 dark:border-b-slate-700 dark:bg-transparent dark:text-white">
        <h2 className="text-xl font-medium">
          Risk Identification using the OWASP DevSecOps-Pipeline
        </h2>

        <p className="mt-2  text-slate-400">
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
