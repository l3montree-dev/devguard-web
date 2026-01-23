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
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";

import { DependencyGraphNode, LoadMoreNode } from "./DependencyGraphNode";

// or if you just want basic styles
import "@xyflow/react/dist/base.css";
import { useTheme } from "next-themes";
import { riskToSeverity, severityToColor } from "./common/Severity";

const isInfoSource = (name: string) => {
  return (
    name.startsWith("sbom:") ||
    name.startsWith("vex:") ||
    name.startsWith("csaf:")
  );
};

// Pagination settings
const MAX_CHILDREN_PER_PAGE = 5;
const INITIAL_CHILDREN_TO_SHOW = 2;
const MIN_VISIBLE_NODES = 2;

// Auto-expand nodes breadth-first until we have at least MIN_VISIBLE_NODES
const autoExpandToMinimum = (
  tree: ViewDependencyTreeNode,
  childCountMap: Map<string, number>,
  childrenLimitMap: Map<string, number>,
): Set<string> => {
  const expanded = new Set<string>();
  expanded.add(tree.name);

  let visibleCount = 1; // Start with root
  const queue: ViewDependencyTreeNode[] = [tree];

  while (queue.length > 0 && visibleCount < MIN_VISIBLE_NODES) {
    const current = queue.shift()!;

    if (!expanded.has(current.name)) {
      continue;
    }

    // Get non-info children and sort them alphabetically
    const children = current.children
      .map((c) => (isInfoSource(c.name) ? c.children : [c]))
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name));
    console.log(current.children, children);

    if (children.length === 0) {
      continue;
    }

    // Add visible children (up to the limit)
    const limit =
      childrenLimitMap.get(current.name) || INITIAL_CHILDREN_TO_SHOW;
    const childrenToShow = Math.min(limit, children.length);
    visibleCount += childrenToShow;

    // Add children to queue for potential expansion
    children.slice(0, childrenToShow).forEach((child) => {
      queue.push(child);
      // Auto-expand first child if we still need more nodes
      if (
        visibleCount < MIN_VISIBLE_NODES &&
        (childCountMap.get(child.name) || 0) > 0
      ) {
        expanded.add(child.name);
      }
    });

    // Process info source children
    current.children
      .filter((c) => isInfoSource(c.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((infoSource) => {
        infoSource.children
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((grandchild) => {
            if (!isInfoSource(grandchild.name)) {
              queue.push(grandchild);
            }
          });
      });
  }

  return expanded;
};
// Pre-populate child counts for all nodes in the tree
const populateChildCounts = (
  node: ViewDependencyTreeNode,
  childCountMap: Map<string, number>,
) => {
  if (!node.name || isInfoSource(node.name)) return;

  // count the number of children
  // if it has an info source child, count its children instead
  const count = node.children.reduce((acc, child) => {
    if (isInfoSource(child.name)) {
      return acc + child.children.length;
    } else {
      return acc + 1;
    }
  }, 0);
  childCountMap.set(node.name, count);

  // Recursively populate for all descendants (sorted for determinism)
  [...node.children]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((child) => {
      if (!isInfoSource(child.name)) {
        populateChildCounts(child, childCountMap);
      } else {
        // For info sources, process their children
        [...child.children]
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((grandchild) => {
            populateChildCounts(grandchild, childCountMap);
          });
      }
    });
};
const addRecursive = (
  dagreGraph: graphlib.Graph,
  node: ViewDependencyTreeNode,
  nodeWidth: number,
  nodeHeight: number,
  infoSourceMap: Map<string, Set<string>>,
  expandedNodes: Set<string>,
  childCountMap: Map<string, number>,
  childrenLimitMap: Map<string, number>,
  riskMap: Map<string, number>,
) => {
  if (node.name !== "" && !isInfoSource(node.name)) {
    dagreGraph.setNode(node.name, {
      width: nodeWidth,
      height: nodeHeight,
    });
    // Store risk for this node
    riskMap.set(node.name, node.risk ?? 0);

    // Only process children if this node is expanded
    const isExpanded = expandedNodes.has(node.name);

    // Get the limit for how many children to show
    const childLimit =
      childrenLimitMap.get(node.name) || INITIAL_CHILDREN_TO_SHOW;
    const totalChildren = childCountMap.get(node.name) || 0;
    let childrenProcessed = 0;

    // Sort children alphabetically for deterministic order
    [...node.children]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((dep) => {
        if (dep.name === "") {
          return;
        }
        // If child is an info source, track it but don't add to graph
        if (isInfoSource(dep.name)) {
          if (!infoSourceMap.has(node.name)) {
            infoSourceMap.set(node.name, new Set());
          }
          infoSourceMap.get(node.name)!.add(dep.name);
          // Continue processing grandchildren as if they were direct children (if expanded)
          if (isExpanded && childrenProcessed < childLimit) {
            [...dep.children]
              .sort((a, b) => a.name.localeCompare(b.name))
              .forEach((grandchild) => {
                if (grandchild.name !== "" && !isInfoSource(grandchild.name)) {
                  if (childrenProcessed >= childLimit) return;
                  childrenProcessed++;

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
                    expandedNodes,
                    childCountMap,
                    childrenLimitMap,
                    riskMap,
                  );
                }
              });
          }
        } else if (isExpanded) {
          // Check if we've reached the limit for this node
          if (childrenProcessed >= childLimit) {
            return;
          }
          childrenProcessed++;

          // Only add child nodes if parent is expanded
          dagreGraph.setNode(dep.name, {
            width: nodeWidth,
            height: nodeHeight,
          });
          dagreGraph.setEdge(node.name, dep.name);
          addRecursive(
            dagreGraph,
            dep,
            nodeWidth,
            nodeHeight,
            infoSourceMap,
            expandedNodes,
            childCountMap,
            childrenLimitMap,
            riskMap,
          );
        }
      });

    // Add "Show more" node if there are more children to display
    if (isExpanded && childrenProcessed < totalChildren) {
      const loadMoreId = `${node.name}__load_more`;
      console.log(loadMoreId);
      dagreGraph.setNode(loadMoreId, { width: nodeWidth, height: nodeHeight });
      dagreGraph.setEdge(node.name, loadMoreId);
      childCountMap.set(loadMoreId, 0); // Load more node has no children
      riskMap.set(loadMoreId, 0);
    }
  }
};

const getLayoutedElements = (
  tree: ViewDependencyTreeNode,
  flaws: Array<DependencyVuln> = [],
  direction = "LR",
  nodeWidth: number,
  nodeHeight: number,
  expandedNodes: Set<string>,
  childrenLimitMap: Map<string, number>,
  previousNodes: Array<any> = [],
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

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 0,
    ranksep: 0,
    edgesep: 0,
    marginx: 20,
    marginy: 20,
  });

  const infoSourceMap = new Map<string, Set<string>>();
  const childCountMap = new Map<string, number>();
  const riskMap = new Map<string, number>();

  // Pre-populate child counts for all nodes
  populateChildCounts(tree, childCountMap);

  addRecursive(
    dagreGraph,
    tree,
    nodeWidth,
    nodeHeight,
    infoSourceMap,
    expandedNodes,
    childCountMap,
    childrenLimitMap,
    riskMap,
  );

  dagre.layout(dagreGraph, { width: 10, height: 10 });

  // Create a map of previous positions
  const previousPositions = new Map(
    previousNodes.map((n) => [n.id, n.position]),
  );

  const nodes = dagreGraph.nodes().map((el) => {
    const nodeWithPosition = dagreGraph.node(el);
    const isLoadMoreNode = el.includes("__load_more");
    const parentId = isLoadMoreNode ? el.replace("__load_more", "") : null;
    const childCount = childCountMap.get(el) || 0;
    const isExpanded = expandedNodes.has(el);
    const shownCount = childrenLimitMap.get(el) || INITIAL_CHILDREN_TO_SHOW;

    // Use previous position if it exists
    // For load more nodes, preserve X but always update Y to position at bottom
    const prevPos = previousPositions.get(el);
    let position: { x: number; y: number };

    if (isLoadMoreNode && prevPos) {
      // Load more node with previous position: keep X, update Y, but only IF increased
      position = {
        x: prevPos.x,
        y: Math.max(10 + nodeWithPosition.y, prevPos.y),
      };
    } else if (prevPos) {
      // Regular node with previous position: keep both X and Y
      position = prevPos;
    } else {
      // New node (including first-time load more): use dagre's calculated position
      position = {
        x: nodeWithPosition.x,
        y: 10 + nodeWithPosition.y,
      };
    }

    return {
      id: el,
      targetPosition: "right",
      sourcePosition: "left",
      type: isLoadMoreNode ? "loadMoreNode" : "customNode",
      position,
      data: {
        label: el,
        risk: riskMap.get(el) ?? 0,
        vuln: vulnMap[el],
        nodeWidth,
        nodeHeight,
        infoSources: infoSourceMap.get(el),
        childCount,
        isExpanded,
        shownCount,
        hasMore: childCount > shownCount,
        isLoadMoreNode,
        parentId,
        remainingCount: parentId
          ? (childCountMap.get(parentId) || 0) -
            (childrenLimitMap.get(parentId) || INITIAL_CHILDREN_TO_SHOW)
          : 0,
      },
    };
  });

  const edges = dagreGraph.edges().map((el) => {
    const source = el.v;
    const target = el.w;
    const targetRisk = riskMap.get(target) ?? 0;
    const hasRisk = targetRisk > 0;

    return {
      id: `${source}-${target}`,
      target: source,
      source: target,
      animated: hasRisk,
      style: {
        stroke:
          targetRisk > 0
            ? severityToColor(riskToSeverity(targetRisk))
            : "#a1a1aa",
      },
    };
  });
  return [nodes, edges];
};

const nodeTypes = {
  customNode: DependencyGraphNode,
  loadMoreNode: LoadMoreNode,
};

const DependencyGraph: FunctionComponent<{
  width: number;
  height: number;
  variant?: "compact";
  flaws: Array<DependencyVuln>;
  graph: ViewDependencyTreeNode;
}> = ({ graph, width, height, flaws, variant }) => {
  const isFirstRender = useRef(true);

  const [viewPort, setViewPort] = useState({ x: 0, y: 0, zoom: 1 });

  // Pre-compute child counts for auto-expansion
  const childCountMapRef = useRef<Map<string, number>>(new Map());
  const childrenLimitMapRef = useRef<Map<string, number>>(new Map());

  if (childCountMapRef.current.size === 0) {
    populateChildCounts(graph, childCountMapRef.current);
  }

  // Auto-expand nodes until we have at least MIN_VISIBLE_NODES
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return autoExpandToMinimum(
      graph,
      childCountMapRef.current,
      childrenLimitMapRef.current,
    );
  });

  // Track how many children to show for each node
  const [childrenLimitMap, setChildrenLimitMap] = useState<Map<string, number>>(
    () => childrenLimitMapRef.current,
  );
  const previousNodesRef = useRef<Array<any>>([]);

  const [initialNodes, initialEdges, rootNode] = useMemo(() => {
    const [nodes, edges] = getLayoutedElements(
      graph,
      flaws,
      "LR",
      300,
      75,
      expandedNodes,
      childrenLimitMap,
      previousNodesRef.current,
    );
    previousNodesRef.current = nodes;

    // get the root node - we use it for the initial position of the viewport
    const rootNode = nodes.find((n) => n.data.label === graph.name)!;
    return [nodes, edges, rootNode];
  }, [graph, flaws, expandedNodes, childrenLimitMap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // just use the root node
      setViewPort({
        x: -rootNode.position.x + 10,
        y: -rootNode.position.y + height / 2, // i have no idea why it fits with a -3 factor
        zoom: 1,
      });
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, rootNode, height, width]);

  const { theme } = useTheme();

  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    const nodeData = node.data;

    // Handle load more node clicks
    if (nodeData.isLoadMoreNode && nodeData.parentId) {
      setChildrenLimitMap((prev) => {
        const next = new Map(prev);
        const current = next.get(nodeData.parentId) || INITIAL_CHILDREN_TO_SHOW;
        // Use remainingCount from the node data itself
        const totalCount = current + nodeData.remainingCount;
        next.set(
          nodeData.parentId,
          Math.min(current + MAX_CHILDREN_PER_PAGE, totalCount),
        );
        return next;
      });
      return;
    }

    // If clicking on "Show more" indicator (hasMore is true and already expanded)
    if (nodeData.hasMore && nodeData.isExpanded) {
      setChildrenLimitMap((prev) => {
        const next = new Map(prev);
        const current = next.get(node.id) || INITIAL_CHILDREN_TO_SHOW;
        next.set(
          node.id,
          Math.min(current + MAX_CHILDREN_PER_PAGE, nodeData.childCount),
        );
        return next;
      });
      return;
    }

    // Toggle expansion if node has children
    if (nodeData.childCount > 0) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
          // Reset limit when collapsing
          setChildrenLimitMap((prevLimits) => {
            const nextLimits = new Map(prevLimits);
            nextLimits.delete(node.id);
            return nextLimits;
          });
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
  };

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
      onNodeClick={handleNodeClick}
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
