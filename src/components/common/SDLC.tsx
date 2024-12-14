import { classNames } from "@/utils/common";
import { Handle, Position, ReactFlow } from "@xyflow/react";

const initialNodes = [
  {
    id: "producer-warn",
    type: "warn",
    position: { x: 40, y: -60 },
    data: {
      label: "A",
    },
  },
  {
    id: "producer-source-warn",
    type: "warn",
    position: { x: 160, y: -60 },
    data: {
      label: "B",
    },
  },
  {
    id: "source-warn",
    type: "warn",
    position: { x: 280, y: -60 },
    data: {
      label: "C",
    },
  },
  {
    id: "source-build-warn",
    type: "warn",
    position: { x: 400, y: -60 },
    data: {
      label: "D",
    },
  },
  {
    id: "dependencies-warn",
    type: "warn",
    position: { x: 380, y: 170 },
    data: {
      label: "E",
      arrowRight: true,
    },
  },
  {
    id: "build-warn",
    type: "warn",
    position: { x: 520, y: -60 },
    data: {
      label: "F",
    },
  },
  {
    id: "build-distribution-warn",
    type: "warn",
    position: { x: 640, y: -60 },
    data: {
      label: "G",
    },
  },
  {
    id: "distribution-warn",
    type: "warn",
    position: { x: 760, y: -60 },
    data: {
      label: "H",
    },
  },
  {
    id: "distribution-consumer-warn",
    type: "warn",
    position: { x: 880, y: -60 },
    data: {
      label: "I",
    },
  },
  {
    id: "consumer-warn",
    type: "warn",
    position: { x: 1000, y: -60 },
    data: {
      label: "J",
    },
  },
  {
    id: "producer",
    type: "plain",
    position: { x: 0, y: 0 },
    data: {
      label: "Producer",
      hasSourceHandle: true,
      help: "A developer, anyone who works on code",
    },
  },
  {
    id: "source",
    type: "custom",
    position: { x: 240, y: 0 },
    data: { label: "Source", help: "GitHub, GitLab, BitBucket" },
  },
  {
    id: "build",
    type: "build",
    position: { x: 480, y: 0 },
    data: { label: "Build", help: "GitLab Runner, GitHub Actions" },
  },
  {
    id: "distribution",
    type: "distribution",
    position: { x: 720, y: 0 },
    data: { label: "Distribution", help: "Dockerhub, NPM-Package-Registry" },
  },
  {
    id: "consumer",
    type: "plain",
    position: { x: 960, y: 0 },
    data: {
      label: "Consumer",
      hasTargetHandle: true,
      help: "User, Kubernetes Infrastructure",
    },
  },
  {
    id: "dependencies",
    type: "dependencies",
    position: { x: 480, y: 140 },
    data: {
      label: "Dependencies",
      help: "Alpine, an NPM-Package",
    },
  },
];
const initialEdges = [
  { id: "1", animated: true, source: "producer", target: "source" },
  { id: "2", animated: true, source: "source", target: "build" },
  { id: "3", animated: true, source: "build", target: "distribution" },
  { id: "4", animated: true, source: "distribution", target: "consumer" },
  {
    id: "5",
    animated: true,
    source: "distribution",
    sourceHandle: "bottom",
    target: "dependencies",
    type: "smoothstep",
  },
  {
    id: "6",
    animated: true,
    source: "dependencies",
    targetHandle: "bottom",
    target: "build",
  },
];

const NodeWarn = ({ data }: any) => {
  return (
    <div className="w-20">
      <div className="flex flex-row justify-center">
        <div className="aspect-square h-7 w-7 rounded-full bg-red-600 text-center text-lg font-medium text-white">
          {data.label}
        </div>
        {data.arrowRight && (
          <div className="bg-red absolute top-1/2 w-[30px] translate-x-full border-t border-dotted bg-red-600" />
        )}
        {!data.arrowRight && (
          <div className="bg-red absolute bottom-0 h-[35px] translate-y-full border-l border-dotted bg-red-600" />
        )}
      </div>
    </div>
  );
};

const Node = ({ data }: any) => {
  return (
    <div className={classNames("w-40 rounded border bg-card p-4 leading-3")}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <span className="inline-block w-full text-center font-medium">
        {data.label}
      </span>
      <span className="mt-3 inline-block text-xs text-muted-foreground">
        {data.help}
      </span>
    </div>
  );
};

const BuildNode = ({ data }: any) => {
  return (
    <div className="w-40 rounded border bg-card p-4 leading-3">
      <Handle type="target" position={Position.Left} />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} />
      <span className="inline-block w-full text-center font-medium">
        {data.label}
      </span>
      <span className="mt-3 inline-block text-xs text-muted-foreground">
        {data.help}
      </span>
    </div>
  );
};

const DependenciesNode = ({ data }: any) => {
  return (
    <div className="w-40 rounded-lg border border-dashed border-muted-foreground p-4 leading-3">
      <Handle type="target" position={Position.Right} />
      <Handle type="source" position={Position.Top} />
      <span className="inline-block w-full text-center font-medium">
        {data.label}
      </span>

      <span className="mt-3 inline-block text-xs text-muted-foreground">
        {data.help}
      </span>
    </div>
  );
};

const DistributionNode = ({ data }: any) => {
  return (
    <div className="w-40 rounded border bg-card p-4 leading-3">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" id="bottom" position={Position.Bottom} />
      <span className="inline-block w-full text-center font-medium">
        {data.label}
      </span>
      <span className="mt-3 inline-block text-xs text-muted-foreground">
        {data.help}
      </span>
    </div>
  );
};

const PlainNode = ({ data }: any) => {
  return (
    <div className="w-40 rounded border  bg-card p-4 leading-3">
      {data.hasTargetHandle && (
        <Handle type="target" position={Position.Left} />
      )}
      {data.hasSourceHandle && (
        <Handle type="source" position={Position.Right} />
      )}
      <span className="inline-block w-full text-center font-medium">
        {data.label}
      </span>
      <span className="mt-3 inline-block text-xs leading-tight text-muted-foreground">
        {data.help}
      </span>
    </div>
  );
};

const SDLC = () => {
  return (
    <div className="hide-handles pointer-events-none h-[360px] w-full">
      <ReactFlow
        preventScrolling={true}
        draggable={false}
        zoomOnScroll={false}
        fitView
        viewport={{ zoom: 1, x: 0, y: 80 }}
        nodesConnectable={false}
        zoomOnPinch={false}
        edgesReconnectable={false}
        nodeTypes={{
          warn: NodeWarn,
          custom: Node,
          build: BuildNode,
          dependencies: DependenciesNode,
          distribution: DistributionNode,
          plain: PlainNode,
        }}
        nodes={initialNodes}
        edges={initialEdges}
      />
    </div>
  );
};

export default SDLC;
