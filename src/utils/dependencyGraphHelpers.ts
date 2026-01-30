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

import dagre, { graphlib } from "@dagrejs/dagre";
import {
  DependencyTreeNode,
  DependencyVuln,
  MinimalDependencyTree,
} from "../types/api/api";
// Pagination settings
export const MAX_CHILDREN_PER_PAGE = 50;
export const INITIAL_CHILDREN_TO_SHOW = 20;
export const MIN_VISIBLE_NODES = 2000;

export interface EdgeMaps {
  childToParentEdges: Map<string, Array<{ parent: string; edgeId: string }>>;
  parentToChildEdges: Map<string, Array<{ child: string; edgeId: string }>>;
}

const isInfoSource = (name: string) => {
  return (
    name.startsWith("sbom:") ||
    name.startsWith("vex:") ||
    name.startsWith("csaf:")
  );
};

// Pre-populate child counts for all nodes in the tree
export const populateChildCounts = (
  node: ViewDependencyTreeNode,
  childCountMap: Map<string, number>,
  visited: Set<string> = new Set(),
) => {
  if (!node.name || isInfoSource(node.name)) return;

  // Prevent infinite recursion due to circular dependencies
  if (visited.has(node.name)) return;
  visited.add(node.name);

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
        populateChildCounts(child, childCountMap, visited);
      } else {
        // For info sources, process their children
        [...child.children]
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((grandchild) => {
            populateChildCounts(grandchild, childCountMap, visited);
          });
      }
    });
};
export const addRecursive = (
  dagreGraph: graphlib.Graph,
  node: ViewDependencyTreeNode,
  nodeWidth: number,
  nodeHeight: number,
  infoSourceMap: Map<string, Set<string>>,
  expandedNodes: Set<string>,
  childCountMap: Map<string, number>,
  childrenLimitMap: Map<string, number>,
  riskMap: Map<string, number>,
  visited: Set<string> = new Set(),
) => {
  if (node.name !== "" && !isInfoSource(node.name)) {
    // Prevent infinite recursion due to circular dependencies
    if (visited.has(node.name)) return;
    visited.add(node.name);

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
                    visited,
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
            visited,
          );
        }
      });

    // Add "Show more" node if there are more children to display
    if (isExpanded && childrenProcessed < totalChildren) {
      const loadMoreId = `${node.name}__load_more`;

      dagreGraph.setNode(loadMoreId, { width: nodeWidth, height: nodeHeight });
      dagreGraph.setEdge(node.name, loadMoreId);
      childCountMap.set(loadMoreId, 0); // Load more node has no children
      riskMap.set(loadMoreId, 0);
    }
  }
};

const percentile = (p: number, values: number[]) => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);

  const idx = (sorted.length - 1) * p;

  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

export const getLayoutedElements = (
  tree: ViewDependencyTreeNode,
  vulns: Array<DependencyVuln> = [],
  direction = "LR",
  nodeWidth: number,
  nodeHeight: number,
  expandedNodes: Set<string>,
  childrenLimitMap: Map<string, number>,
  previousNodes: Array<any> = [],
  onExpansionToggle?: (nodeId: string) => void,
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
    style: { stroke: string; strokeWidth: number };
    className?: string;
  }>,
] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // build a map of all affected packages
  const vulnMap = vulns.reduce(
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
        onExpansionToggle,
      },
    };
  });

  // Build edge lookup maps for impact calculation
  const childToParentEdges = new Map<
    string,
    Array<{ parent: string; edgeId: string }>
  >();
  const parentToChildEdges = new Map<
    string,
    Array<{ child: string; edgeId: string }>
  >();

  dagreGraph.edges().forEach((el) => {
    const source = el.v; // parent
    const target = el.w; // child
    const edgeId = `${source}-${target}`;

    const existingParents = childToParentEdges.get(target) || [];
    existingParents.push({ parent: source, edgeId });
    childToParentEdges.set(target, existingParents);

    const existingChildren = parentToChildEdges.get(source) || [];
    existingChildren.push({ child: target, edgeId });
    parentToChildEdges.set(source, existingChildren);
  });

  // mark all 95 percentile nodes as critical
  // only focus on nodes which are real components
  const riskValues = Array.from(
    riskMap
      .entries()
      .filter(([id]) => id.startsWith("pkg:"))
      .map(([_, v]) => v)
      .filter((r) => r > 0),
  );

  const criticalThreshold = percentile(0.95, riskValues);

  const edges = dagreGraph.edges().map((el) => {
    const source = el.v; // parent
    const target = el.w; // child
    const edgeId = `${source}-${target}`;

    // Calculate stroke width based on flow
    // Edges with more vulnerability flow get thicker

    // High impact edges get thicker stroke and special styling
    return {
      id: edgeId,
      target: source,
      source: target,
      animated: false,
      style: {
        stroke: "#a1a1aa",
        strokeWidth: 2,
      },
    };
  });

  // Update nodes to mark critical ones and add propagation data
  const updatedNodes = nodes.map((node) => {
    return {
      ...node,
      data: {
        ...node.data,
        isCritical:
          node.id.startsWith("pkg:") &&
          (node.data.risk || 0) >= criticalThreshold,
      },
    };
  });

  return [updatedNodes, edges];
};

// Auto-expand nodes breadth-first until we have at least MIN_VISIBLE_NODES
export const autoExpandToMinimum = (
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

/**
 * Performs downward traversal from starting nodes
 * Continues only if child has a single incoming edge and is a package node
 */
export const traverseDownward = (
  startNodes: string[],
  pathEdgeIds: Set<string>,
  edgeMaps: EdgeMaps,
): void => {
  const visitedDown = new Set<string>();
  const queueDown: string[] = [...startNodes];

  while (queueDown.length > 0) {
    const currentNode = queueDown.shift()!;
    if (visitedDown.has(currentNode)) continue;
    visitedDown.add(currentNode);

    const childEdges = edgeMaps.parentToChildEdges.get(currentNode);
    if (childEdges) {
      for (const { edgeId, child } of childEdges) {
        pathEdgeIds.add(edgeId);
        const incomingToChild = edgeMaps.childToParentEdges.get(child);
        if (incomingToChild && incomingToChild.length === 1) {
          queueDown.push(child);
        }
      }
    }
  }
};

/**
 * Performs upward traversal from starting nodes
 * Continues only if parent has a single outgoing edge and is a package node
 */
export const traverseUpward = (
  startNodes: string[],
  pathEdgeIds: Set<string>,
  edgeMaps: EdgeMaps,
): void => {
  const visitedUp = new Set<string>();
  const queueUp: string[] = [...startNodes];

  while (queueUp.length > 0) {
    const currentNode = queueUp.shift()!;
    if (visitedUp.has(currentNode)) continue;
    visitedUp.add(currentNode);

    const parentEdges = edgeMaps.childToParentEdges.get(currentNode);
    if (parentEdges) {
      for (const { edgeId, parent } of parentEdges) {
        pathEdgeIds.add(edgeId);
        const outgoing = edgeMaps.parentToChildEdges.get(parent);
        if (outgoing && outgoing.length === 1) {
          queueUp.push(parent);
        }
      }
    }
  }
};

/**
 * Propagates highlighting bidirectionally:
 * 1. If ALL incoming edges (from children toward parents) of a node are highlighted,
 *    that node would be removed, so mark ALL its outgoing edges (to children)
 * 2. If ALL outgoing edges (to children) of a node are highlighted,
 *    that node is "useless" (all dependants removed), so mark ALL its incoming edges (to parents)
 */
export const propagateHighlighting = (
  pathEdgeIds: Set<string>,
  edgeMaps: EdgeMaps,
): void => {
  let changed = true;
  while (changed) {
    changed = false;

    const removedNodes = new Set<string>();

    // Check if all edges TO PARENTS are marked (original behavior)
    // childToParentEdges.get(node) = edges from node to its parents
    edgeMaps.childToParentEdges.forEach((edgesToParents, nodeId) => {
      const allToParentsMarked = edgesToParents.every(({ edgeId }) =>
        pathEdgeIds.has(edgeId),
      );
      if (allToParentsMarked) {
        removedNodes.add(nodeId);
      }
    });

    // Check if all edges TO CHILDREN are marked (node is useless - all dependants gone)
    // parentToChildEdges.get(node) = edges from node to its children
    edgeMaps.parentToChildEdges.forEach((edgesToChildren, nodeId) => {
      const allToChildrenMarked = edgesToChildren.every(({ edgeId }) =>
        pathEdgeIds.has(edgeId),
      );
      if (allToChildrenMarked) {
        removedNodes.add(nodeId);
      }
    });

    // For removed nodes, mark all their edges in both directions
    removedNodes.forEach((nodeId) => {
      // Mark all outgoing edges (to children)
      const edgesToChildren = edgeMaps.parentToChildEdges.get(nodeId);
      if (edgesToChildren) {
        edgesToChildren.forEach(({ edgeId }) => {
          if (!pathEdgeIds.has(edgeId)) {
            pathEdgeIds.add(edgeId);
            changed = true;
          }
        });
      }

      // Mark all incoming edges (to parents)
      const edgesToParents = edgeMaps.childToParentEdges.get(nodeId);
      if (edgesToParents) {
        edgesToParents.forEach(({ edgeId }) => {
          if (!pathEdgeIds.has(edgeId)) {
            pathEdgeIds.add(edgeId);
            changed = true;
          }
        });
      }
    });
  }
};

/**
 * Calculates percentile values from an array of numbers
 */
export const getPercentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

/**
 * Classifies impact level based on percentile thresholds
 */
export const classifyImpactLevel = (
  value: number,
  p90: number,
  p75: number,
  p50: number,
): "critical" | "high" | "medium" | "low" => {
  if (value >= p90) return "critical";
  if (value >= p75) return "high";
  if (value >= p50) return "medium";
  return "low";
};

/**
 * Propagates risk upward through the dependency tree
 */
const propagateRiskUpward = (
  node: ViewDependencyTreeNode,
  riskToAdd: number,
  visited: Set<ViewDependencyTreeNode> = new Set(),
) => {
  if (!node.parents || node.parents.length === 0) return;

  const riskPerParent = riskToAdd / node.parents.length;

  node.parents.forEach((parent) => {
    if (parent && !visited.has(parent)) {
      visited.add(parent);

      const newRisk = parent.risk ? parent.risk + riskPerParent : riskPerParent;

      // Cap risk at 100 - represents maximum vulnerability exposure
      parent.risk = newRisk;
      // Recursively propagate to parent's parents
      propagateRiskUpward(parent, riskPerParent, visited);
    }
  });
};

export const recursiveAddRisk = (
  node: ViewDependencyTreeNode,
  vulns: Array<DependencyVuln>,
) => {
  // Track which nodes we've already processed to avoid double-counting
  const processedNodes = new Set<ViewDependencyTreeNode>();
  // Global visited set for risk propagation - ensures each node is updated only once
  const propagationVisited = new Set<ViewDependencyTreeNode>();

  // Track recursion stack for cycle detection. We keep both an array (stack)
  // for identifying cycle members and a set for O(1) membership checks.
  const recursionStack: ViewDependencyTreeNode[] = [];
  const recursionSet = new Set<string>();

  const markCycleFromIndex = (startIdx: number) => {
    for (let i = startIdx; i < recursionStack.length; i++) {
      recursionStack[i].hasCycle = true;
    }
  };

  // Then recursively process the tree
  const processNode = (n: ViewDependencyTreeNode) => {
    // If the node is already on the current recursion stack -> we've found a cycle
    if (recursionSet.has(n.name)) {
      const idx = recursionStack.findIndex((x) => x.name === n.name);
      if (idx !== -1) {
        // Mark all nodes that are part of the cycle
        markCycleFromIndex(idx);
      }
      // Stop further traversal along this path to avoid infinite recursion
      return;
    }

    // Skip if already processed (handles diamond dependencies)
    if (processedNodes.has(n)) return;
    processedNodes.add(n);

    // Push onto recursion stack
    recursionSet.add(n.name);
    recursionStack.push(n);

    const nodeFlaws = vulns.filter((p) => p.componentPurl === n.name);

    // Set risk to 100 if this node has vulnerabilities
    if (nodeFlaws.length > 0) {
      n.risk = 100;
      propagationVisited.add(n);
      // Propagate risk upward through all ancestors
      // Use the GLOBAL visited set to ensure each ancestor is only updated once
      propagateRiskUpward(n, n.risk, propagationVisited);
    }

    // Recursively process all children
    for (const child of n.children) {
      // If child is already known to participate in a cycle, skip descending into it
      if (child.hasCycle) continue;
      processNode(child);
    }

    // Pop from recursion stack
    recursionStack.pop();
    recursionSet.delete(n.name);
  };

  processNode(node);
  return node;
};

export const convertPathsToTree = (
  paths: Array<Array<string>>,
  vulns: Array<DependencyVuln>,
): ViewDependencyTreeNode => {
  const root: ViewDependencyTreeNode = {
    name: "ROOT",
    children: [],
    risk: 0,
    parents: [],
    nodeType: "root",
  };

  const nodeMap = new Map<string, ViewDependencyTreeNode>();
  nodeMap.set(root.name, root);

  for (const path of paths) {
    let currentNode = root;
    for (const part of path) {
      // if we see ROOT again, skip
      if (part === "ROOT") {
        continue;
      }
      // check if we already have this child
      const node = nodeMap.get(part);
      if (node) {
        // already exists, move to that node
        if (!currentNode.children.includes(node)) {
          currentNode.children.push(node);
          node.parents.push(currentNode);
        }

        currentNode = node;
        continue;
      }

      // create new node
      let childNode: ViewDependencyTreeNode | undefined =
        currentNode.children.find((child) => child.name === part);
      if (!childNode) {
        childNode = pathEntryToViewNode(part);
        // since we add our own root element, we filter out every root node types
        currentNode.children.push(childNode);
        childNode.parents.push(currentNode);
        nodeMap.set(part, childNode);
      }
      currentNode = childNode;
    }
  }
  recursiveAddRisk(root, vulns);
  return root;
};

export interface ViewDependencyTreeNode extends Omit<
  DependencyTreeNode,
  "children"
> {
  risk: number;
  parents: Array<ViewDependencyTreeNode>;
  children: ViewDependencyTreeNode[];
  nodeType: "root" | "artifact" | "component" | "infosource";
  infoSourceType?: "sbom" | "csaf" | "vex";
  // Optional flag that marks nodes participating in a cycle. Used to avoid infinite recursion and for UI highlighting.
  hasCycle?: boolean;
}

export function minimalTreeToViewDependencyTreeNode(
  tree?: MinimalDependencyTree,
): ViewDependencyTreeNode {
  if (!tree) {
    return {
      name: "ROOT",
      risk: 0,
      parents: [],
      children: [],
      nodeType: "component",
    };
  }

  const nodes = new Map<string, ViewDependencyTreeNode>();

  // Create all nodes
  for (const entry of tree.nodes) {
    nodes.set(entry, pathEntryToViewNode(entry));
  }

  // now recursively add children
  for (const [parentEntry, childEntries] of Object.entries(tree.dependencies)) {
    const parentNode = nodes.get(parentEntry);
    if (parentNode) {
      for (const childEntry of childEntries) {
        const childNode = nodes.get(childEntry);
        if (childNode) {
          parentNode.children.push(childNode);
          childNode.parents.push(parentNode);
        }
      }
    }
  }

  return nodes.get("")!;
}

export const pathEntryToViewNode = (entry: string): ViewDependencyTreeNode => {
  if (!entry.includes(":")) {
  }
  const parts = entry.split(":");
  let nodeType: "root" | "artifact" | "component" | "infosource";
  let infoSourceType: "sbom" | "csaf" | "vex" | undefined = undefined;
  if (parts.length === 1) {
    nodeType = "root";
  } else {
    const prefix = parts[0];
    switch (prefix) {
      case "artifact":
        nodeType = "artifact";
        break;
      case "sbom":
        nodeType = "infosource";
        infoSourceType = "sbom";
        break;
      case "vex":
        nodeType = "infosource";
        infoSourceType = "vex";
        break;
      case "csaf":
        nodeType = "infosource";
        infoSourceType = "csaf";
        break;
      default:
        nodeType = "component";
    }
  }

  return {
    name: entry === "" ? "ROOT" : entry,
    children: [],
    risk: 0,
    parents: [],
    nodeType,
    infoSourceType,
  };
};

export const convertGraph = (
  graph: DependencyTreeNode,
  parent: ViewDependencyTreeNode | null = null,
): ViewDependencyTreeNode => {
  const convertedNode = pathEntryToViewNode(graph.name);
  if (parent !== null && !convertedNode.parents.includes(parent))
    convertedNode.parents.push(parent);
  convertedNode.children = graph.children.map((child) =>
    convertGraph(child, convertedNode),
  );
  return convertedNode;
};

export const recursiveRemoveWithoutRisk = (
  node: ViewDependencyTreeNode,
  recursionSet: Set<string> = new Set(),
) => {
  // Detect cycles by tracking nodes in the current recursion stack using their names.
  if (recursionSet.has(node.name)) {
    // Mark node as being part of a cycle so callers can handle it specially if needed
    node.hasCycle = true;
    // Stop further descent to avoid infinite recursion. Preserve the node (don't prune).
    return node;
  }

  // Add current node to recursion set
  recursionSet.add(node.name);

  // If this node has no risk, prune it (and its subtree)
  if (node.risk === 0) {
    recursionSet.delete(node.name);
    return null;
  }

  // Recurse into children safely, passing down the same recursion set
  node.children = node.children
    .map((c) => recursiveRemoveWithoutRisk(c, recursionSet))
    .filter((n): n is ViewDependencyTreeNode => n !== null);

  // Remove current node from recursion set before returning
  recursionSet.delete(node.name);
  return node;
};
