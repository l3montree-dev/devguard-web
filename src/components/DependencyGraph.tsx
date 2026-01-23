// Copyright (C) 2024 Tim Bastin, l3montree GmbH
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
import { DependencyVuln } from "@/types/api/api";
import { ViewDependencyTreeNode } from "@/types/view/assetTypes";
import dagre, { graphlib } from "@dagrejs/dagre";
import {
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { DependencyGraphNode } from "./DependencyGraphNode";

// or if you just want basic styles
import { beautifyPurl } from "@/utils/common";
import "@xyflow/react/dist/base.css";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { riskToSeverity, severityToColor } from "./common/Severity";

const isInfoSource = (name: string) => {
  return name.startsWith("sbom:") || name.startsWith("vex:");
};

const addRecursive = (
  dagreGraph: graphlib.Graph,
  node: ViewDependencyTreeNode,
  nodeWidth: number,
  nodeHeight: number,
  infoSourceMap: Map<string, Set<string>>,
) => {
  if (node.name !== "" && !isInfoSource(node.name)) {
    dagreGraph.setNode(node.name, { width: nodeWidth, height: nodeHeight });
    node.children.forEach((dep) => {
      if (dep.name === "") {
        return;
      }
      // If child is an info source, track it but don't add to graph
      if (isInfoSource(dep.name)) {
        if (!infoSourceMap.has(node.name)) {
          infoSourceMap.set(node.name, new Set());
        }
        infoSourceMap.get(node.name)!.add(dep.name);
        // Continue processing grandchildren as if they were direct children
        dep.children.forEach((grandchild) => {
          if (grandchild.name !== "" && !isInfoSource(grandchild.name)) {
            dagreGraph.setNode(grandchild.name, {
              width: nodeWidth,
              height: nodeHeight,
            });
            dagreGraph.setEdge(node.name, grandchild.name);
            addRecursive(
              dagreGraph,
              grandchild,
              nodeWidth,
              nodeHeight,
              infoSourceMap,
            );
          }
        });
      } else {
        dagreGraph.setNode(dep.name, { width: nodeWidth, height: nodeHeight });
        dagreGraph.setEdge(node.name, dep.name);
        addRecursive(dagreGraph, dep, nodeWidth, nodeHeight, infoSourceMap);
      }
    });
  }
};

const recursiveEdges = (
  node: ViewDependencyTreeNode,
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
  flaws: Array<DependencyVuln> = [],
  direction = "LR",
  nodeWidth: number,
  nodeHeight: number,
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
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // build a map of all affected packages
  const vulnMap = flaws.reduce(
    (acc, cur) => {
      if (!acc[cur.componentPurl!]) {
        acc[cur.componentPurl!] = [];
      }
      acc[cur.componentPurl!].push(cur);
      return acc;
    },
    {} as { [key: string]: DependencyVuln[] },
  );

  const riskMap = recursiveFlatten(tree).reduce(
    (acc, cur) => {
      acc[cur.name] = cur.risk;
      return acc;
    },
    {} as { [key: string]: number },
  );

  dagreGraph.setGraph({ rankdir: direction });

  const infoSourceMap = new Map<string, Set<string>>();

  addRecursive(dagreGraph, tree, nodeWidth, nodeHeight, infoSourceMap);

  dagre.layout(dagreGraph);

  const nodes = dagreGraph.nodes().map((el) => {
    const nodeWithPosition = dagreGraph.node(el);
    // unfortunately we need this little hack to pass a slightly different position
    // to notify react flow about the change. Moreover we are shifting the dagre node position
    // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
    return {
      id: el,
      targetPosition: "right",
      sourcePosition: "left",
      type: "customNode",
      style: {
        // backgroundColor: riskToBgColor(riskMap[el]),
      },
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: 10 + (nodeWithPosition.y - nodeHeight / 2),
      },
      data: {
        label: el,
        risk: riskMap[el],
        vuln: vulnMap[el],
        nodeWidth,
        nodeHeight,
        infoSources: infoSourceMap.get(el),
      },
    };
  });

  const edges = dagreGraph.edges().map((el) => {
    const source = el.v;
    const target = el.w;
    const targetRisk = riskMap[target];
    const hasRisk = targetRisk > 0;

    return {
      id: `${source}-${target}`,
      target: source,
      source: target,
      animated: hasRisk,
      style: {
        stroke:
          riskMap[target] > 0
            ? severityToColor(riskToSeverity(riskMap[target]))
            : "#a1a1aa",
      },
    };
  });
  return [nodes, edges];
};

const nodeTypes = {
  customNode: DependencyGraphNode,
};

const DependencyGraph: FunctionComponent<{
  width: number;
  height: number;
  variant?: "compact";
  flaws: Array<DependencyVuln>;
  graph: ViewDependencyTreeNode;
}> = ({ graph, width, height, flaws, variant }) => {
  const searchParams = useSearchParams();

  const [viewPort, setViewPort] = useState({ x: 0, y: 0, zoom: 1 });

  const [initialNodes, initialEdges, rootNode] = useMemo(() => {
    const [nodes, edges] = getLayoutedElements(
      graph,
      flaws,
      "LR",
      variant === "compact" ? 150 : 300,
      variant === "compact" ? 150 : 300,
    );

    // get the root node - we use it for the initial position of the viewport
    const rootNode = nodes.find((n) => n.data.label === graph.name)!;
    return [nodes, edges, rootNode];
  }, [graph, variant, flaws]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    // check if we want to focus a specific node
    if (searchParams?.has("pkg")) {
      const focusNode = initialNodes.find((n) =>
        beautifyPurl(n.data.label).startsWith(
          beautifyPurl(searchParams.get("pkg") as string),
        ),
      );

      if (focusNode) {
        setViewPort({
          x: -focusNode.position.x + width / 2,
          y: -focusNode.position.y + height / 2,
          zoom: 1,
        });
      }
      return;
    }

    // just use the root node
    setViewPort({
      x: -rootNode.position.x + 10,
      y: -rootNode.position.y + height / 2, // i have no idea why it fits with a -3 factor
      zoom: 1,
    });
  }, [
    initialNodes,
    initialEdges,
    setEdges,
    setNodes,
    rootNode,
    width,
    height,
    searchParams,
  ]);

  const { theme } = useTheme();

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      nodesConnectable={false}
      edges={edges}
      edgesFocusable={false}
      defaultEdgeOptions={{
        selectable: false,
      }}
      onlyRenderVisibleElements={true}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      viewport={viewPort}
      onViewportChange={setViewPort}
    >
      {variant !== "compact" && (
        <MiniMap
          maskColor="rgba(0, 0, 0, 0.3)"
          zoomable
          style={{
            backgroundColor:
              theme === "dark"
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.5)",
          }}
        />
      )}
    </ReactFlow>
  );
};

export default DependencyGraph;
