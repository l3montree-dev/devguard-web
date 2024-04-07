// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import { useActiveAsset } from "@/hooks/useActiveAsset";
import { AffectedPackage, CVE, DependencyTreeNode } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import dagre, { graphlib } from "@dagrejs/dagre";
import { FunctionComponent, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import tinycolor from "tinycolor2";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 300;
const nodeHeight = 100;

const riskToBgColor = (risk: number) => {
  const red = new tinycolor("red");
  const color = red.lighten((1 - risk) * 50).toString("hex");

  return color;
};

const riskToTextColor = (risk: number) => {
  const red = new tinycolor("red");
  return red.lighten((1 - risk) * 50).isLight() ? "black" : "white";
};

const addRecursive = (dagreGraph: graphlib.Graph, node: DependencyTreeNode) => {
  if (node.name !== "") {
    dagreGraph.setNode(node.name, { width: nodeWidth, height: nodeHeight });
    node.children.forEach((dep) => {
      if (dep.name === "") {
        return;
      }
      dagreGraph.setNode(dep.name, { width: nodeWidth, height: nodeHeight });
      dagreGraph.setEdge(node.name, dep.name);
      addRecursive(dagreGraph, dep);
    });
  }
};

const recursiveEdges = (
  node: DependencyTreeNode,
): Array<{ id: string; source: string; target: string }> => {
  if (node.children.length === 0) {
    return [];
  }
  const directEdges = node.children.map((child) => ({
    id: `${node.name}-${child.name}`,
    source: node.name,
    target: child.name,
  }));
  const childEdges = node.children.map(recursiveEdges).flat();
  return directEdges.concat(childEdges);
};

const recursiveFlatten = (
  node: ViewDependencyTreeNode,
): Array<{ name: string; risk: number }> => {
  return [
    {
      name: node.name,
      risk: node.risk ?? 0,
    },
    ...node.children.map((child) => recursiveFlatten(child)).flat(),
  ];
};

const getLayoutedElements = (
  tree: ViewDependencyTreeNode,
  affectedPackages: Array<AffectedPackage> = [],
  direction = "LR",
): [
  Array<{
    id: string;
    position: { x: number; y: number };
    data: { label: string };
  }>,
  Array<{
    id: string;
    source: string;
    target: string;
  }>,
] => {
  // build a map of all affected packages
  const affectedMap = affectedPackages.reduce(
    (acc, cur) => {
      acc[cur.PurlWithVersion] = cur;
      return acc;
    },
    {} as { [key: string]: AffectedPackage },
  );

  const riskMap = recursiveFlatten(tree).reduce(
    (acc, cur) => {
      acc[cur.name] = cur.risk;
      return acc;
    },
    {} as { [key: string]: number },
  );

  dagreGraph.setGraph({ rankdir: direction });

  addRecursive(dagreGraph, tree);

  dagre.layout(dagreGraph);

  const nodes = dagreGraph.nodes().map((el) => {
    const nodeWithPosition = dagreGraph.node(el);
    // unfortunately we need this little hack to pass a slightly different position
    // to notify react flow about the change. Moreover we are shifting the dagre node position
    // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
    const bgColor = riskToBgColor(riskMap[el]);
    return {
      id: el,
      targetPosition: "right",
      sourcePosition: "left",
      style: {
        border: bgColor,
        boxShadow: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`,
        backgroundColor: riskToBgColor(riskMap[el]),
        color: riskToTextColor(riskMap[el]),
      },
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: 10 + (nodeWithPosition.y - nodeHeight / 2),
      },
      data: {
        label: el,
      },
    };
  });
  const edges = dagreGraph.edges().map((el) => {
    const source = el.v;
    const target = el.w;

    return {
      id: `${source}-${target}`,
      target: source,
      source: target,
      // type: "smoothstep",
      animated: true,
      style: {
        stroke:
          riskMap[target] > 0 ? riskToBgColor(riskMap[target]) : "#a1a1aa",
      },
    };
  });
  return [nodes, edges];
};

const DependencyGraph: FunctionComponent<{
  width: number;
  height: number;
  affectedPackages: Array<AffectedPackage>;
  graph: { root: ViewDependencyTreeNode };
}> = ({ graph, width, height, affectedPackages }) => {
  const asset = useActiveAsset();

  const [initialNodes, initialEdges, rootNode] = useMemo(() => {
    graph.root.name = asset?.name ?? "";

    const [nodes, edges] = getLayoutedElements(graph.root, affectedPackages);
    // get the root node - we use it for the initial position of the viewport
    const rootNode = nodes.find((n) => n.data.label === graph.root.name)!;
    return [nodes, edges, rootNode];
  }, [graph, asset?.name, affectedPackages]);

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div
      style={{
        width,
        height,
      }}
    >
      <ReactFlow
        nodes={nodes}
        nodesConnectable={false}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={console.log}
        defaultViewport={{
          zoom: 1,
          x: rootNode.position.x - width / 2,
          y: -(rootNode.position.y - height * -4),
        }}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
