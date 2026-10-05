// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { classNames } from "@/utils/common";

import { ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FunctionComponent } from "react";

// or if you just want basic styles
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import "@xyflow/react/dist/base.css";
import {
  autoExpandToMinimum,
  getLayoutedElements,
  INITIAL_CHILDREN_TO_SHOW,
  MAX_CHILDREN_PER_PAGE,
  populateChildCounts,
} from "../utils/dependencyGraphHelpers";
import type { ViewDependencyTreeNode } from "../types/view/dependencyGraph";
import { DependencyGraphNode, LoadMoreNode } from "./DependencyGraphNode";
import { Button } from "./ui/button";
import { Move } from "lucide-react";

const nodeTypes = {
  customNode: DependencyGraphNode,
  loadMoreNode: LoadMoreNode,
};

const DependencyGraph: FunctionComponent<{
  height: number;
  graph: ViewDependencyTreeNode;
}> = ({ graph, height }) => {
  const isFirstRender = useRef(true);

  const [viewPort, setViewPort] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDependencyGraphFullscreen, setIsDependencyGraphFullscreen] =
    useState(false);

  // Pre-compute child counts for auto-expansion
  const childCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    populateChildCounts(graph, counts);
    return counts;
  }, [graph]);

  // Auto-expand nodes until we have at least MIN_VISIBLE_NODES
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    return autoExpandToMinimum(graph, childCountMap, new Map());
  });

  // Track how many children to show for each node
  const [childrenLimitMap, setChildrenLimitMap] = useState<Map<string, number>>(
    () => new Map(),
  );

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

  const previousNodesRef = useRef<Array<any>>([]);

  /* eslint-disable react-hooks/refs -- dagre needs the previous frame's node
     positions to keep nodes from jumping when a subtree expands; prior-render
     data is only reachable through a ref. */
  const [initialNodes, initialEdges, rootNode] = useMemo(() => {
    const [nodes, edges] = getLayoutedElements(
      graph,
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
    const rootNode = nodes.find((n) => n.id === graph.id);
    return [nodes, edges, rootNode];
  }, [graph, expandedNodes, childrenLimitMap, handleExpansionToggle]);
  /* eslint-enable react-hooks/refs */

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    if (isFirstRender.current && rootNode) {
      isFirstRender.current = false;
      setViewPort({
        x: -rootNode.position.x + 10,
        y: -rootNode.position.y + height / 2,
        zoom: 1,
      });
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, rootNode, height]);

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
    }
  };

  return (
    <div
      className={
        isDependencyGraphFullscreen
          ? "fixed bg-background left-0 top-0 z-50 h-screen w-screen"
          : "relative h-full w-full"
      }
    >
      <div
        className={classNames(
          "absolute z-10 flex flex-row gap-2 justify-end",
          isDependencyGraphFullscreen ? "right-8 top-4" : "right-2 top-2",
        )}
      >
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
      <div className="absolute z-10 left-2 top-2">
        <span className="text-sm text-muted-foreground/60 flex items-center gap-1">
          <Move className="h-3 w-3" />
          You can interact with this graph
        </span>
      </div>
      {/* Todo: Find a better way to disable edge cursor pointer. This is a bit
      hacky but works for now. Issue 1708 */}
      <style>{`.react-flow__edge.selectable { cursor: grab !important; }`}</style>
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
      />
    </div>
  );
};

export default DependencyGraph;
