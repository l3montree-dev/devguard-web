// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { beautifyPurl, extractVersion } from "@/utils/common";
import { Handle, Position } from "@xyflow/react";
import type { FunctionComponent } from "react";

export const LoadMoreNode: FunctionComponent<{
  data: {
    parentId: string;
    remainingCount: number;
    nodeWidth: number;
    nodeHeight: number;
  };
}> = (props) => {
  return (
    <div
      style={{
        width: props.data.nodeWidth,
      }}
      className="relative border-2 border-dashed border-primary/50 rounded-lg p-3 text-xs hover:bg-primary/10 transition-all cursor-pointer"
    >
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="target"
        position={Position.Right}
      />
      <div className="flex flex-col gap-1 items-center justify-center text-center">
        <PlusIcon className="w-4 h-4 text-primary" />
        <span className="text-primary font-medium">
          Show {props.data.remainingCount} more
        </span>
      </div>
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="source"
        position={Position.Left}
      />
    </div>
  );
};

import { PlusIcon } from "@heroicons/react/24/outline";
import { ArrowLeft, ArrowRight } from "lucide-react";

import EcosystemImage from "./common/EcosystemImage";
import { Badge } from "./ui/badge";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    nodeWidth: number;
    nodeHeight: number;
    childCount?: number;
    isExpanded?: boolean;
    onExpansionToggle?: (nodeId: string) => void;
  };
  id: string;
}

export const DependencyGraphNode: FunctionComponent<
  DependencyGraphNodeProps
> = (props) => {
  const hasChildren = (props.data.childCount ?? 0) > 0;
  const isExpanded = props.data.isExpanded ?? false;
  const version = extractVersion(props.data.label);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.data.onExpansionToggle) {
      props.data.onExpansionToggle(props.id);
    }
  };

  return (
    <div
      style={{
        width: props.data.nodeWidth,
      }}
      className="relative border-2 border-border rounded-lg p-3 text-xs text-card-foreground bg-card transition-all cursor-grab active:cursor-grabbing"
    >
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="target"
        position={Position.Right}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-row gap-2">
          <div className="flex gap-2 flex-row items-start">
            {props.data.label.startsWith("pkg:") && (
              <div className="flex-shrink-0 mt-0.5">
                <EcosystemImage packageName={props.data.label} size={16} />
              </div>
            )}

            <div>
              <label
                htmlFor="text"
                className="text-left font-medium leading-tight flex-1 cursor-[inherit] flex items-center gap-2 flex-wrap"
              >
                {beautifyPurl(props.data.label)}
                {version && (
                  <Badge className="ml-2" variant={"outline"}>
                    {version}
                  </Badge>
                )}
              </label>
            </div>
          </div>
          {hasChildren && (
            <button
              onClick={handleArrowClick}
              className="ml-2 flex-shrink-0 text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors cursor-pointer p-1 -m-1 rounded hover:bg-accent"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="source"
        position={Position.Left}
        id="a"
      />
    </div>
  );
};
