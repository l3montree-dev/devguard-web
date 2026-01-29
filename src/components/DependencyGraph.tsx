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
import { beautifyPurl, classNames } from "@/utils/common";
import dagre, { graphlib } from "@dagrejs/dagre";
import {
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DependencyGraphNode, LoadMoreNode } from "./DependencyGraphNode";

// or if you just want basic styles
import "@xyflow/react/dist/base.css";
import { useTheme } from "next-themes";
import { riskToSeverity, severityToColor } from "./common/Severity";
import { Button } from "./ui/button";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

// Types for the context menu
type MenuType = "edge" | "node" | null;

interface ContextMenuState {
  type: MenuType;
  x: number;
  y: number;
  // For edge menu
  parentName?: string;
  childName?: string;
  // For node menu
  nodeName?: string;
}

// VEX justification options
export interface VexSelection {
  type: "edge" | "node";
  justification: string;
  parentName?: string;
  childName?: string;
  nodeName?: string;
}

const isInfoSource = (name: string) => {
  return (
    name.startsWith("sbom:") ||
    name.startsWith("vex:") ||
    name.startsWith("csaf:")
  );
};

// Pagination settings
const MAX_CHILDREN_PER_PAGE = 50;
const INITIAL_CHILDREN_TO_SHOW = 20;
const MIN_VISIBLE_NODES = 2000;

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
    animated: boolean;
    style: { stroke: string };
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
    ranksep: 100,
    edgesep: 0,
    marginx: 0,
    marginy: 0,
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
  onVexSelect?: (selection: VexSelection) => void;
}> = ({ graph, width, height, flaws, variant, onVexSelect }) => {
  const isFirstRender = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewPort, setViewPort] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDependencyGraphFullscreen, setIsDependencyGraphFullscreen] =
    useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

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

  // Precompute edge lookup maps for O(1) access during hover
  const edgeMaps = useMemo(() => {
    const strokeMap = new Map<string, string>();
    // A node can have multiple parents in a DAG, so store all parent edges
    const childToParentEdges = new Map<
      string,
      Array<{ edgeId: string; parent: string }>
    >();
    // Also store parent -> children edges for outgoing traversal
    const parentToChildEdges = new Map<
      string,
      Array<{ edgeId: string; child: string }>
    >();

    for (const edge of initialEdges) {
      strokeMap.set(edge.id, edge.style?.stroke || "#a1a1aa");

      // child -> parent (for upward traversal)
      const existingParents = childToParentEdges.get(edge.source) || [];
      existingParents.push({ edgeId: edge.id, parent: edge.target });
      childToParentEdges.set(edge.source, existingParents);

      // parent -> child (for downward traversal)
      const existingChildren = parentToChildEdges.get(edge.target) || [];
      existingChildren.push({ edgeId: edge.id, child: edge.source });
      parentToChildEdges.set(edge.target, existingChildren);
    }

    return { strokeMap, childToParentEdges, parentToChildEdges };
  }, [initialEdges]);

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

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: any) => {
      const pathEdgeIds = new Set<string>();

      // Don't highlight for load more nodes
      if (node.data.isLoadMoreNode) return;

      const currentNode = node.id;

      // Get all incoming edges to the hovered node
      const incomingEdges = edgeMaps.childToParentEdges.get(currentNode);
      if (incomingEdges) {
        for (const { edgeId } of incomingEdges) {
          pathEdgeIds.add(edgeId);
        }
      }

      // Get all outgoing edges from the hovered node
      const outgoingEdges = edgeMaps.parentToChildEdges.get(currentNode);
      if (outgoingEdges) {
        for (const { edgeId } of outgoingEdges) {
          pathEdgeIds.add(edgeId);
        }
      }

      // Upward traversal - continue upward if the parent has only one outgoing edge
      const visitedUp = new Set<string>();
      const queueUp: string[] = [];

      // Start upward traversal from all parents
      if (incomingEdges) {
        for (const { parent } of incomingEdges) {
          const parentOutgoing = edgeMaps.parentToChildEdges.get(parent);
          if (parentOutgoing && parentOutgoing.length === 1) {
            queueUp.push(parent);
          }
        }
      }

      while (queueUp.length > 0) {
        const currentUpNode = queueUp.shift()!;
        if (visitedUp.has(currentUpNode)) continue;
        visitedUp.add(currentUpNode);

        const parentEdges = edgeMaps.childToParentEdges.get(currentUpNode);
        if (parentEdges) {
          for (const { edgeId, parent } of parentEdges) {
            pathEdgeIds.add(edgeId);

            // Continue upwards only if parent has a single outgoing edge
            const parentOutgoing = edgeMaps.parentToChildEdges.get(parent);
            if (parentOutgoing && parentOutgoing.length === 1) {
              queueUp.push(parent);
            }
          }
        }
      }

      // Downward traversal - continue downward if the child has only one incoming edge
      const visitedDown = new Set<string>();
      const queueDown: string[] = [];

      // Start downward traversal from all children
      if (outgoingEdges) {
        for (const { child } of outgoingEdges) {
          const childIncoming = edgeMaps.childToParentEdges.get(child);
          if (childIncoming && childIncoming.length === 1) {
            queueDown.push(child);
          }
        }
      }

      while (queueDown.length > 0) {
        const currentDownNode = queueDown.shift()!;
        if (visitedDown.has(currentDownNode)) continue;
        visitedDown.add(currentDownNode);

        const childEdges = edgeMaps.parentToChildEdges.get(currentDownNode);
        if (childEdges) {
          for (const { edgeId, child } of childEdges) {
            pathEdgeIds.add(edgeId);

            // Continue downwards only if the child has a single incoming edge
            const childIncoming = edgeMaps.childToParentEdges.get(child);
            if (childIncoming && childIncoming.length === 1) {
              queueDown.push(child);
            }
          }
        }
      }

      setEdges((currentEdges) =>
        currentEdges.map((e) => {
          const isOnPath = pathEdgeIds.has(e.id);
          const originalStroke = edgeMaps.strokeMap.get(e.id) || "#a1a1aa";

          if (isOnPath) {
            return {
              ...e,
              style: {
                ...e.style,
                stroke: "#F8BD25",
                strokeWidth: 3,
              },
              zIndex: 1000,
            };
          }

          return {
            ...e,
            style: {
              ...e.style,
              stroke: originalStroke,
              strokeWidth: 1,
            },
            zIndex: 0,
          };
        }),
      );
    },
    [edgeMaps, setEdges],
  );

  const handleNodeMouseLeave = () => {
    // Reset all edges to original styles
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const originalStroke = edgeMaps.strokeMap.get(edge.id) || "#a1a1aa";
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: originalStroke,
            strokeWidth: 1,
          },
          zIndex: 0,
        };
      }),
    );
  };

  // Edge hover handler - highlight incoming edges recursively
  // Always highlight all incoming edges to the parent of the hovered edge
  // Then recursively continue for grandparents only if they have one outgoing edge
  const handleEdgeMouseEnter = useCallback(
    (_event: React.MouseEvent, edge: any) => {
      const pathEdgeIds = new Set<string>();

      // Always add the hovered edge itself
      pathEdgeIds.add(edge.id);

      // The parent node of the hovered edge (where we start looking for incoming edges)
      const parentNode = edge.target;
      const childNode = edge.source;
      const visited = new Set<string>();

      // if the parent only has this SINGLE outgoing edge, we highlight all incoming edges to it
      // since marking the hovered edge as false positive, would also imply the entire path to it is false positive
      const parentOutgoing = edgeMaps.parentToChildEdges.get(parentNode);
      const isOnlyChild =
        !parentOutgoing ||
        (parentOutgoing.length === 1 && parentOutgoing[0].child === childNode);

      let queue: string[] = [];
      if (isOnlyChild) {
        // Queue for recursive traversal
        queue = [parentNode];
      }
      while (queue.length > 0) {
        const currentNode = queue.shift()!;
        if (visited.has(currentNode)) continue;
        visited.add(currentNode);

        const parentEdges = edgeMaps.childToParentEdges.get(currentNode);

        // highlight all incoming edges to currentNode
        if (parentEdges) {
          for (const { edgeId } of parentEdges) {
            pathEdgeIds.add(edgeId);
          }
          // if currentNode only has a single outgoing edge, continue upwards
          const outgoing = edgeMaps.parentToChildEdges.get(currentNode);
          if (outgoing && outgoing.length === 1) {
            queue.push(currentNode);
          }
        }
      }

      // if we would remove that edge, and the child node only has a single incoming edge (exactly this one), we can continue downwards as well
      const childIncoming = edgeMaps.childToParentEdges.get(childNode);
      const isOnlyParent =
        !childIncoming ||
        (childIncoming.length === 1 && childIncoming[0].parent === parentNode);

      if (isOnlyParent) {
        // Downward traversal
        const visitedDown = new Set<string>();
        const queueDown: string[] = [childNode];
        while (queueDown.length > 0) {
          const currentNode = queueDown.shift()!;
          if (visitedDown.has(currentNode)) continue;
          visitedDown.add(currentNode);

          const childEdges = edgeMaps.parentToChildEdges.get(currentNode);
          if (childEdges) {
            for (const { edgeId, child } of childEdges) {
              pathEdgeIds.add(edgeId);
              const incomingToChild = edgeMaps.childToParentEdges.get(child);
              // Continue downwards only if the child has a single incoming edge
              if (incomingToChild && incomingToChild.length === 1) {
                queueDown.push(child);
              }
            }
          }
        }
      }

      setEdges((currentEdges) =>
        currentEdges.map((e) => {
          const isOnPath = pathEdgeIds.has(e.id);
          const originalStroke = edgeMaps.strokeMap.get(e.id) || "#a1a1aa";

          if (isOnPath) {
            return {
              ...e,
              style: {
                ...e.style,
                stroke: "#F8BD25",
                strokeWidth: 3,
              },
              zIndex: 1000,
            };
          }

          return {
            ...e,
            style: {
              ...e.style,
              stroke: originalStroke,
              strokeWidth: 1,
            },
            zIndex: 0,
          };
        }),
      );
    },
    [edgeMaps, setEdges],
  );

  const handleEdgeMouseLeave = useCallback(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const originalStroke = edgeMaps.strokeMap.get(edge.id) || "#a1a1aa";
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: originalStroke,
            strokeWidth: 1,
          },
          zIndex: 0,
        };
      }),
    );
  }, [edgeMaps, setEdges]);

  // Edge click handler - show context menu
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: any) => {
    event.stopPropagation();
    const parentName = edge.target;
    const childName = edge.source;

    setContextMenu({
      type: "edge",
      x: event.clientX,
      y: event.clientY,
      parentName,
      childName,
    });
  }, []);

  // Node context menu click handler
  const handleNodeContextClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      event.stopPropagation();

      // Don't show menu for load more nodes
      if (node.data.isLoadMoreNode) return;

      setContextMenu({
        type: "node",
        x: event.clientX,
        y: event.clientY,
        nodeName: node.id,
      });
    },
    [],
  );

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle VEX selection from context menu
  const handleVexOptionClick = useCallback(
    (justification: string) => {
      if (!contextMenu || !onVexSelect) return;

      if (contextMenu.type === "edge") {
        onVexSelect({
          type: "edge",
          justification,
          parentName: contextMenu.parentName,
          childName: contextMenu.childName,
        });
      } else if (contextMenu.type === "node") {
        onVexSelect({
          type: "node",
          justification,
          nodeName: contextMenu.nodeName,
        });
      }

      closeContextMenu();
    },
    [contextMenu, onVexSelect, closeContextMenu],
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu, closeContextMenu]);

  // Helper to beautify node names for display
  const getDisplayName = (name: string) => {
    if (name.startsWith("pkg:")) {
      return beautifyPurl(name);
    }
    return name;
  };

  return (
    <div
      ref={containerRef}
      className={
        isDependencyGraphFullscreen
          ? "fixed bg-black left-0 top-0 z-50 h-screen w-screen"
          : "relative h-full w-full"
      }
    >
      <div
        className={classNames(
          "absolute z-10 flex flex-row justify-end bg-black/100",
          isDependencyGraphFullscreen ? "right-8 top-4" : "right-2 top-2",
        )}
      >
        <Button
          onClick={() => setIsDependencyGraphFullscreen((prev) => !prev)}
          variant={"outline"}
          size={"icon"}
        >
          {isDependencyGraphFullscreen ? (
            <ArrowsPointingInIcon className="h-5 w-5" />
          ) : (
            <ArrowsPointingOutIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        edges={edges}
        edgesFocusable={true}
        defaultEdgeOptions={{
          selectable: true,
        }}
        onlyRenderVisibleElements={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        viewport={viewPort}
        onViewportChange={setViewPort}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onNodeContextMenu={handleNodeContextClick}
        onEdgeMouseEnter={handleEdgeMouseEnter}
        onEdgeMouseLeave={handleEdgeMouseLeave}
        onEdgeClick={handleEdgeClick}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] min-w-[280px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === "edge" &&
            contextMenu.parentName &&
            contextMenu.childName && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Edge: {getDisplayName(contextMenu.parentName)} →{" "}
                  {getDisplayName(contextMenu.childName)}
                </div>
                <div className="h-px bg-muted my-1" />
                <button
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() =>
                    handleVexOptionClick("does_not_call_vulnerable_function")
                  }
                >
                  {getDisplayName(contextMenu.parentName)} does not call
                  vulnerable function of {getDisplayName(contextMenu.childName)}
                </button>
                <button
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleVexOptionClick("inline_mitigations")}
                >
                  {getDisplayName(contextMenu.parentName)} implements inline
                  mitigations to avoid executing vulnerable functions of{" "}
                  {getDisplayName(contextMenu.childName)}
                </button>
                <button
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() =>
                    handleVexOptionClick("uncontrollable_by_attacker")
                  }
                >
                  {getDisplayName(contextMenu.parentName)} makes vulnerable code
                  uncontrollable for an attacker
                </button>
              </>
            )}

          {contextMenu.type === "node" && contextMenu.nodeName && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Node: {getDisplayName(contextMenu.nodeName)}
              </div>
              <div className="h-px bg-muted my-1" />
              <button
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleVexOptionClick("not_present")}
              >
                {getDisplayName(contextMenu.nodeName)} not present (wrong
                version matching)
              </button>
              <button
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleVexOptionClick("no_vulnerable_code")}
              >
                {getDisplayName(contextMenu.nodeName)} does not include
                vulnerable code
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DependencyGraph;
