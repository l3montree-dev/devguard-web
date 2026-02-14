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

import { beautifyPurl, classNames, extractVersion } from "@/utils/common";
import { Handle, Position } from "@xyflow/react";
import { FunctionComponent } from "react";

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
import { DependencyVuln } from "../types/api/api";
import EcosystemImage from "./common/EcosystemImage";
import { Badge } from "./ui/badge";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    vuln: DependencyVuln[];
    risk: number;
    nodeWidth: number;
    nodeHeight: number;
    childCount?: number;
    isExpanded?: boolean;
    shownCount?: number;
    hasMore?: boolean;
    propagationCount?: number;
    propagationRatio?: number;
    flow?: number;
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
  const propagationRatio = props.data.propagationRatio || 0;

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
      className={classNames(
        "relative border-2 rounded-lg p-3 text-xs text-card-foreground bg-card transition-all cursor-pointer active:cursor-grabbing",
        props.data.vuln
          ? props.data.vuln.every((v) => v.state === "falsePositive")
            ? "border-gray-500/50 shadow-md"
            : "border-red-500 shadow-lg"
          : "border-border",
      )}
    >
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="target"
        position={Position.Right}
      />
      <div className="flex flex-col gap-2">
        {props.data.vuln && (
          <div className="absolute -top-2 -right-2 z-10">
            {props.data.vuln.every((v) => v.state === "falsePositive") ? (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-semibold shadow-md bg-gray-500/80 text-white border-gray-500/80"
              >
                False Positive
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-semibold shadow-md bg-red-500 text-white border-red-500"
                title={`Marking this node's dependencies as false positive would affect ${Math.round(propagationRatio * 100)}% of the graph`}
              >
                Vulnerable
              </Badge>
            )}
          </div>
        )}
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
                className="text-left font-medium leading-tight flex-1 cursor-[inherit]"
              >
                {beautifyPurl(props.data.label)}
                {version && <Badge variant={"outline"}>{version}</Badge>}
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
