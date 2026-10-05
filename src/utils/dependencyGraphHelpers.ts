// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import dagre, { graphlib } from "@dagrejs/dagre";

import type { ViewDependencyTreeNode } from "../types/view/dependencyGraph";
// Pagination settings
export const MAX_CHILDREN_PER_PAGE = 50;
export const INITIAL_CHILDREN_TO_SHOW = 20;
export const MIN_VISIBLE_NODES = 2000;

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
  if (!node.id || isInfoSource(node.name)) return;

  // Prevent infinite recursion due to circular dependencies
  if (visited.has(node.id)) return;
  visited.add(node.id);

  // count the number of children
  // if it has an info source child, count its children instead
  const count = node.children.reduce((acc, child) => {
    if (isInfoSource(child.name)) {
      return acc + child.children.length;
    } else {
      return acc + 1;
    }
  }, 0);
  childCountMap.set(node.id, count);

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
  visited: Set<string> = new Set(),
  nameMap: Map<string, string> = new Map(),
) => {
  if (node.id !== "" && !isInfoSource(node.name)) {
    // Prevent infinite recursion due to circular dependencies
    if (visited.has(node.id)) return;
    visited.add(node.id);
    nameMap.set(node.id, node.name);

    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
    // Only process children if this node is expanded
    const isExpanded = expandedNodes.has(node.id);

    // Get the limit for how many children to show
    const childLimit =
      childrenLimitMap.get(node.id) || INITIAL_CHILDREN_TO_SHOW;
    const totalChildren = childCountMap.get(node.id) || 0;
    let childrenProcessed = 0;

    // Sort children alphabetically for deterministic order
    [...node.children]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((dep) => {
        if (dep.id === "") {
          return;
        }
        // If child is an info source, track it but don't add to graph
        if (isInfoSource(dep.name)) {
          if (!infoSourceMap.has(node.id)) {
            infoSourceMap.set(node.id, new Set());
          }
          infoSourceMap.get(node.id)!.add(dep.name);
          // Continue processing grandchildren as if they were direct children (if expanded)
          if (isExpanded && childrenProcessed < childLimit) {
            [...dep.children]
              .sort((a, b) => a.name.localeCompare(b.name))
              .forEach((grandchild) => {
                if (grandchild.id !== "" && !isInfoSource(grandchild.name)) {
                  if (childrenProcessed >= childLimit) return;
                  childrenProcessed++;

                  dagreGraph.setNode(grandchild.id, {
                    width: nodeWidth,
                    height: nodeHeight,
                  });
                  dagreGraph.setEdge(node.id, grandchild.id);
                  addRecursive(
                    dagreGraph,
                    grandchild,
                    nodeWidth,
                    nodeHeight,
                    infoSourceMap,
                    expandedNodes,
                    childCountMap,
                    childrenLimitMap,
                    visited,
                    nameMap,
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
          dagreGraph.setNode(dep.id, {
            width: nodeWidth,
            height: nodeHeight,
          });
          dagreGraph.setEdge(node.id, dep.id);
          addRecursive(
            dagreGraph,
            dep,
            nodeWidth,
            nodeHeight,
            infoSourceMap,
            expandedNodes,
            childCountMap,
            childrenLimitMap,
            visited,
            nameMap,
          );
        }
      });

    // Add "Show more" node if there are more children to display
    if (isExpanded && childrenProcessed < totalChildren) {
      const loadMoreId = `${node.id}__load_more`;

      dagreGraph.setNode(loadMoreId, { width: nodeWidth, height: nodeHeight });
      dagreGraph.setEdge(node.id, loadMoreId);
      childCountMap.set(loadMoreId, 0); // Load more node has no children
    }
  }
};

export const getLayoutedElements = (
  tree: ViewDependencyTreeNode,
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
  }>,
] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

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
  const nameMap = new Map<string, string>();

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
    new Set(),
    nameMap,
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
        label: nameMap.get(el) ?? el,
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

  const edges = dagreGraph.edges().map((el) => {
    const source = el.v; // parent
    const target = el.w; // child

    return {
      id: `${source}-${target}`,
      target: source,
      source: target,
      animated: false,
      style: {
        stroke: "#a1a1aa",
        strokeWidth: 2,
      },
    };
  });

  return [nodes, edges];
};

// Auto-expand nodes breadth-first until we have at least MIN_VISIBLE_NODES
export const autoExpandToMinimum = (
  tree: ViewDependencyTreeNode,
  childCountMap: Map<string, number>,
  childrenLimitMap: Map<string, number>,
): Set<string> => {
  const expanded = new Set<string>();
  expanded.add(tree.id);

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

export const convertPathsToTree = (
  paths: Array<Array<string>>,
): ViewDependencyTreeNode => {
  const root: ViewDependencyTreeNode = {
    id: "ROOT",
    name: "ROOT",
    children: [],
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

      // Wildcards are positional — never reuse them via nodeMap to avoid cycles
      if (part === "*") {
        const wildcardNode = pathEntryToViewNode(part);
        currentNode.children.push(wildcardNode);
        currentNode = wildcardNode;
        continue;
      }

      // check if we already have this child
      const node = nodeMap.get(part);
      if (node) {
        // already exists, move to that node
        if (!currentNode.children.includes(node)) {
          currentNode.children.push(node);
        }

        currentNode = node;
        continue;
      }

      // create new node
      let childNode: ViewDependencyTreeNode | undefined =
        currentNode.children.find((child) => child.name === part);
      if (!childNode) {
        childNode = pathEntryToViewNode(part);
        currentNode.children.push(childNode);
        nodeMap.set(part, childNode);
      }
      currentNode = childNode;
    }
  }

  return root;
};

const pathEntryToViewNode = (entry: string): ViewDependencyTreeNode => {
  const name = entry === "" ? "ROOT" : entry;
  return {
    id: name === "*" ? crypto.randomUUID() : name,
    name,
    children: [],
  };
};
