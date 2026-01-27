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

// or if you just want basic styles
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import "@xyflow/react/dist/base.css";
import { useTheme } from "next-themes";
import {
  autoExpandToMinimum,
  getLayoutedElements,
  INITIAL_CHILDREN_TO_SHOW,
  MAX_CHILDREN_PER_PAGE,
  populateChildCounts,
  propagateHighlighting,
  traverseDownward,
  traverseUpward,
} from "../utils/dependencyGraphHelpers";
import { DependencyGraphNode, LoadMoreNode } from "./DependencyGraphNode";
import { Button } from "./ui/button";

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

const nodeTypes = {
  customNode: DependencyGraphNode,
  loadMoreNode: LoadMoreNode,
};

const DependencyGraph: FunctionComponent<{
  width: number;
  height: number;
  variant?: "compact";
  vulns: Array<DependencyVuln>;
  graph: ViewDependencyTreeNode;
  onVexSelect?: (selection: VexSelection) => void;
}> = ({ graph, width, height, vulns, variant, onVexSelect }) => {
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
      vulns,
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
  }, [graph, vulns, expandedNodes, childrenLimitMap]);

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
    const strokeWidthMap = new Map<string, number>();
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
      strokeWidthMap.set(edge.id, edge.style?.strokeWidth || 1);

      // child -> parent (for upward traversal)
      const existingParents = childToParentEdges.get(edge.source) || [];
      existingParents.push({ edgeId: edge.id, parent: edge.target });
      childToParentEdges.set(edge.source, existingParents);

      // parent -> child (for downward traversal)
      const existingChildren = parentToChildEdges.get(edge.target) || [];
      existingChildren.push({ edgeId: edge.id, child: edge.source });
      parentToChildEdges.set(edge.target, existingChildren);
    }

    return {
      strokeMap,
      strokeWidthMap,
      childToParentEdges,
      parentToChildEdges,
    };
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

      // Collect nodes for upward traversal (parents with single outgoing edge)
      const upwardStartNodes: string[] = [];
      if (incomingEdges) {
        for (const { parent } of incomingEdges) {
          const parentOutgoing = edgeMaps.parentToChildEdges.get(parent);
          if (parentOutgoing && parentOutgoing.length === 1) {
            upwardStartNodes.push(parent);
          }
        }
      }
      traverseUpward(upwardStartNodes, pathEdgeIds, edgeMaps);

      // Collect nodes for downward traversal (children with single incoming edge)
      const downwardStartNodes: string[] = [];
      if (outgoingEdges) {
        for (const { child } of outgoingEdges) {
          const childIncoming = edgeMaps.childToParentEdges.get(child);
          if (childIncoming && childIncoming.length === 1) {
            downwardStartNodes.push(child);
          }
        }
      }
      traverseDownward(downwardStartNodes, pathEdgeIds, edgeMaps);

      // Propagate highlighting
      propagateHighlighting(pathEdgeIds, edgeMaps);

      setEdges((currentEdges) =>
        currentEdges.map((e) => {
          const isOnPath = pathEdgeIds.has(e.id);
          const originalStroke = edgeMaps.strokeMap.get(e.id) || "#a1a1aa";
          const originalStrokeWidth = edgeMaps.strokeWidthMap.get(e.id) || 1;

          if (isOnPath) {
            return {
              ...e,
              style: {
                ...e.style,
                stroke: "#F8BD25",
                strokeWidth: originalStrokeWidth + 2,
              },
              zIndex: 1000,
            };
          }

          return {
            ...e,
            style: {
              ...e.style,
              stroke: originalStroke,
              strokeWidth: edgeMaps.strokeWidthMap.get(e.id) || 1,
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
        const originalStrokeWidth = edgeMaps.strokeWidthMap.get(edge.id) || 1;
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: originalStroke,
            strokeWidth: originalStrokeWidth,
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

      // if the parent only has this SINGLE outgoing edge, we highlight all incoming edges to it
      // since marking the hovered edge as false positive, would also imply the entire path to it is false positive
      const parentOutgoing = edgeMaps.parentToChildEdges.get(parentNode);
      const isOnlyChild =
        !parentOutgoing ||
        (parentOutgoing.length === 1 && parentOutgoing[0].child === childNode);

      if (isOnlyChild) {
        traverseUpward([parentNode], pathEdgeIds, edgeMaps);
      }

      // if we would remove that edge, and the child node only has a single incoming edge (exactly this one), we can continue downwards as well
      const childIncoming = edgeMaps.childToParentEdges.get(childNode);
      const isOnlyParent =
        !childIncoming ||
        (childIncoming.length === 1 && childIncoming[0].parent === parentNode);

      if (isOnlyParent) {
        traverseDownward([childNode], pathEdgeIds, edgeMaps);
      }

      // Propagate highlighting
      propagateHighlighting(pathEdgeIds, edgeMaps);

      setEdges((currentEdges) =>
        currentEdges.map((e) => {
          const isOnPath = pathEdgeIds.has(e.id);
          const originalStroke = edgeMaps.strokeMap.get(e.id) || "#a1a1aa";
          const originalStrokeWidth = edgeMaps.strokeWidthMap.get(e.id) || 1;

          if (isOnPath) {
            return {
              ...e,
              style: {
                ...e.style,
                stroke: "#F8BD25",
                strokeWidth: originalStrokeWidth + 2,
              },
              zIndex: 1000,
            };
          }

          return {
            ...e,
            style: {
              ...e.style,
              stroke: originalStroke,
              strokeWidth: edgeMaps.strokeWidthMap.get(e.id) || 1,
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
        const originalStrokeWidth = edgeMaps.strokeWidthMap.get(edge.id) || 1;
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: originalStroke,
            strokeWidth: originalStrokeWidth,
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
