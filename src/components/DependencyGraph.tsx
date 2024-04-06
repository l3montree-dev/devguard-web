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
import { DependencyTreeNode } from "@/types/common";
import dagre, { graphlib } from "@dagrejs/dagre";
import { FunctionComponent, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 300;
const nodeHeight = 100;

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
  node: DependencyTreeNode,
): Array<{ name: string }> => {
  return [
    {
      name: node.name,
    },
    ...node.children.map((child) => recursiveFlatten(child)).flat(),
  ];
};

const getLayoutedElements = (
  tree: DependencyTreeNode,
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
  dagreGraph.setGraph({ rankdir: direction });

  addRecursive(dagreGraph, tree);

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

      style: {
        border: "1px solid #777",
      },
      position: {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
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
    };
  });
  return [nodes, edges];
};

const DependencyGraph: FunctionComponent<{
  width: number;
  height: number;
  graph: { root: DependencyTreeNode };
}> = ({ graph, width, height }) => {
  const asset = useActiveAsset();
  const [initialNodes, initialEdges] = useMemo(() => {
    graph.root.name = asset?.name ?? "";
    const [nodes, edges] = getLayoutedElements(graph.root);
    return [nodes, edges];
  }, [graph, asset?.name]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
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
        onSelect={console.log}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={console.log}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
