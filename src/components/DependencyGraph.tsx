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
  InformationCircleIcon,
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
  ViewDependencyTreeNode,
} from "../utils/dependencyGraphHelpers";
import { DependencyGraphNode, LoadMoreNode } from "./DependencyGraphNode";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  enableContextMenu?: boolean;
  variant?: "compact";
  vulns: Array<DependencyVuln>;
  graph: ViewDependencyTreeNode;
  // Handler for context-menu VEX actions. Can be async and should return `true` if it handled the action
  // (for example by creating a false-positive rule). If it returns falsy / undefined, component will still close the menu.
  onVexSelect?: (selection: VexSelection) => Promise<boolean> | void;
  highlightPath?: string[];
}> = ({
  graph,
  width,
  height,
  vulns,
  variant,
  onVexSelect,
  enableContextMenu,
  highlightPath,
}) => {
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

  // Handle expansion toggle from arrow click
  const handleExpansionToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        // Reset limit when collapsing
        setChildrenLimitMap((prevLimits) => {
          const nextLimits = new Map(prevLimits);
          nextLimits.delete(nodeId);
          return nextLimits;
        });
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

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
      handleExpansionToggle,
    );
    previousNodesRef.current = nodes;

    // get the root node - we use it for the initial position of the viewport
    const rootNode = nodes.find((n) => n.data.label === graph.name)!;
    return [nodes, edges, rootNode];
  }, [graph, vulns, expandedNodes, childrenLimitMap, handleExpansionToggle]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    // Apply highlighting to vulnerability path
    const edgesWithHighlight = initialEdges.map((edge) => {
      if (!highlightPath || highlightPath.length === 0) return edge;

      // Check if this edge is part of the vulnerability path
      const parentIndex = highlightPath.indexOf(edge.target);
      const childIndex = highlightPath.indexOf(edge.source);

      // Edge is in path if both nodes are in path and parent comes before child
      const isInPath =
        parentIndex !== -1 &&
        childIndex !== -1 &&
        parentIndex === childIndex - 1;

      if (isInPath) {
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: "#3b82f6", // blue-500
            strokeWidth: 3,
          },
          zIndex: 999,
        };
      }

      return edge;
    });

    setEdges(edgesWithHighlight);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // just use the root node
      setViewPort({
        x: -rootNode.position.x + 10,
        y: -rootNode.position.y + height / 2,
        zoom: 1,
      });
    }
  }, [
    initialNodes,
    initialEdges,
    setNodes,
    setEdges,
    rootNode,
    height,
    width,
    highlightPath,
  ]);

  // Precompute edge lookup maps for O(1) access during hover
  const edgeMaps = useMemo(() => {
    const strokeMap = new Map<string, string>();
    const strokeWidthMap = new Map<string, number>();
    const highlightPathEdges = new Set<string>();

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
      // Check if edge is in highlight path
      let isHighlightEdge = false;
      if (highlightPath && highlightPath.length > 0) {
        const parentIndex = highlightPath.indexOf(edge.target);
        const childIndex = highlightPath.indexOf(edge.source);
        isHighlightEdge =
          parentIndex !== -1 &&
          childIndex !== -1 &&
          parentIndex === childIndex - 1;
        if (isHighlightEdge) {
          highlightPathEdges.add(edge.id);
        }
      }

      // Store original or highlighted stroke
      strokeMap.set(
        edge.id,
        isHighlightEdge ? "#3b82f6" : edge.style?.stroke || "#a1a1aa",
      );
      strokeWidthMap.set(
        edge.id,
        isHighlightEdge ? 3 : edge.style?.strokeWidth || 1,
      );

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
      highlightPathEdges,
    };
  }, [initialEdges, highlightPath]);

  const { theme } = useTheme();

  // Helper function to apply hover highlighting to edges
  const applyHoverHighlight = useCallback(
    (pathEdgeIds: Set<string>) => {
      setEdges((currentEdges) =>
        currentEdges.map((e) => {
          const isOnPath = pathEdgeIds.has(e.id);
          const isHighlightPath = edgeMaps.highlightPathEdges.has(e.id);
          const originalStroke = edgeMaps.strokeMap.get(e.id) || "#a1a1aa";
          const originalStrokeWidth = edgeMaps.strokeWidthMap.get(e.id) || 1;

          if (isOnPath) {
            return {
              ...e,
              style: {
                ...e.style,
                // Use purple for highlighted path on hover, yellow for normal hover
                stroke: isHighlightPath ? "#a855f7" : "#F8BD25",
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
            zIndex: isHighlightPath ? 999 : 0,
          };
        }),
      );
    },
    [edgeMaps, setEdges],
  );

  // Helper function to reset edges to original styles
  const resetEdgesToOriginal = useCallback(() => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const isHighlightPath = edgeMaps.highlightPathEdges.has(edge.id);
        const originalStroke = edgeMaps.strokeMap.get(edge.id) || "#a1a1aa";
        const originalStrokeWidth = edgeMaps.strokeWidthMap.get(edge.id) || 1;
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: originalStroke,
            strokeWidth: originalStrokeWidth,
          },
          zIndex: isHighlightPath ? 999 : 0,
        };
      }),
    );
  }, [edgeMaps, setEdges]);

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
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
    if (!enableContextMenu) return;
    // Show context menu for regular nodes
    setContextMenu({
      type: "node",
      x: event.clientX,
      y: event.clientY,
      nodeName: node.id,
    });
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

      applyHoverHighlight(pathEdgeIds);
    },
    [edgeMaps, applyHoverHighlight],
  );

  const handleNodeMouseLeave = useCallback(() => {
    resetEdgesToOriginal();
  }, [resetEdgesToOriginal]);

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

      applyHoverHighlight(pathEdgeIds);
    },
    [edgeMaps, applyHoverHighlight],
  );

  const handleEdgeMouseLeave = useCallback(() => {
    resetEdgesToOriginal();
  }, [resetEdgesToOriginal]);

  // Edge click handler - show context menu
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: any) => {
      if (!enableContextMenu) return;
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
    },
    [enableContextMenu],
  );

  // Node context menu click handler
  const handleNodeContextClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      event.stopPropagation();

      // Don't show menu for load more nodes
      if (node.data.isLoadMoreNode || !enableContextMenu) return;

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
    async (justification: string) => {
      if (!contextMenu) return;

      if (!onVexSelect) {
        closeContextMenu();
        return;
      }

      const selection: VexSelection =
        contextMenu.type === "edge"
          ? {
              type: "edge",
              justification,
              parentName: contextMenu.parentName,
              childName: contextMenu.childName,
            }
          : {
              type: "node",
              justification,
              nodeName: contextMenu.nodeName,
            };

      try {
        const res = await onVexSelect(selection as VexSelection);
        // If handler returned true (handled), close and don't do anything else
        if (res === true) {
          closeContextMenu();
          return;
        }
      } catch (err) {
        // swallow error and continue to close menu
      }

      // Ensure menu is closed in all cases
      closeContextMenu();
    },
    [contextMenu, onVexSelect, closeContextMenu],
  );

  // Helper to beautify node names for display
  const getDisplayName = (name: string) => {
    return beautifyPurl(name);
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
          "absolute z-10 flex flex-row gap-2 justify-end",
          isDependencyGraphFullscreen ? "right-8 top-4" : "right-2 top-2",
        )}
      >
        <Popover>
          <PopoverTrigger asChild className="bg-background">
            <Button variant={"outline"} size={"icon"}>
              <InformationCircleIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-2xl" align="end">
            <div className="text-xs">
              <div className="font-semibold mb-3">Legend</div>
              <div className="gap-6 flex flex-row">
                {/* Node Types */}
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Nodes</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-red-500 rounded bg-card flex-shrink-0"></div>
                    <span>Vulnerable - Contains known vulnerability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-border rounded bg-card flex-shrink-0"></div>
                    <span>Normal - Standard dependency</span>
                  </div>
                </div>

                {/* Edge Colors */}
                <div className="space-y-2">
                  <div className="font-medium text-muted-foreground">Edges</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-500 flex-shrink-0"></div>
                    <span>Vulnerability path</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-purple-500 flex-shrink-0"></div>
                    <span>Vulnerability path (hover)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0.5 flex-shrink-0"
                      style={{ backgroundColor: "#F8BD25" }}
                    ></div>
                    <span>Dependency path (hover)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-zinc-400 flex-shrink-0"></div>
                    <span>Normal edge</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => setIsDependencyGraphFullscreen((prev) => !prev)}
          variant={"outline"}
          size={"icon"}
          className="bg-background"
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
      {/* Context Menu with DropdownMenu */}
      <DropdownMenu
        open={!!contextMenu}
        onOpenChange={(open) => !open && closeContextMenu()}
      >
        {contextMenu && (
          <>
            {/* Invisible trigger positioned at click location */}
            <DropdownMenuTrigger asChild>
              <div
                style={{
                  position: "fixed",
                  left: contextMenu.x,
                  top: contextMenu.y,
                  width: 0,
                  height: 0,
                  pointerEvents: "none",
                }}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-80"
              align="start"
              side="bottom"
              sideOffset={5}
            >
              {contextMenu.type === "edge" &&
                contextMenu.parentName &&
                contextMenu.childName && (
                  <>
                    <DropdownMenuItem
                      className="flex-col items-start gap-1 py-3"
                      onClick={() =>
                        handleVexOptionClick(
                          "does_not_call_vulnerable_function",
                        )
                      }
                    >
                      <span className="font-medium leading-none">
                        Does Not Call Vulnerable Function
                      </span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        {getDisplayName(contextMenu.parentName)} does not call
                        vulnerable code in{" "}
                        {getDisplayName(contextMenu.childName)}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex-col items-start gap-1 py-3"
                      onClick={() => handleVexOptionClick("inline_mitigations")}
                    >
                      <span className="font-medium leading-none">
                        Inline Mitigations
                      </span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        {getDisplayName(contextMenu.parentName)} implements
                        safeguards against vulnerable code
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex-col items-start gap-1 py-3"
                      onClick={() =>
                        handleVexOptionClick("uncontrollable_by_attacker")
                      }
                    >
                      <span className="font-medium leading-none">
                        Uncontrollable by Attacker
                      </span>
                      <span className="text-xs text-muted-foreground leading-snug">
                        {getDisplayName(contextMenu.parentName)} makes sure,
                        that vulnerable code cannot be exploited in this context
                      </span>
                    </DropdownMenuItem>
                  </>
                )}

              {contextMenu.type === "node" && contextMenu.nodeName && (
                <>
                  <DropdownMenuItem
                    className="flex-col items-start gap-1 py-3"
                    onClick={() => handleVexOptionClick("not_present")}
                  >
                    <span className="font-medium leading-none">
                      Not Present
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      Wrong version matching - dependency not present
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex-col items-start gap-1 py-3"
                    onClick={() => handleVexOptionClick("no_vulnerable_code")}
                  >
                    <span className="font-medium leading-none">
                      No Vulnerable Code
                    </span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      This version does not include vulnerable code
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </>
        )}
      </DropdownMenu>
    </div>
  );
};

export default DependencyGraph;
