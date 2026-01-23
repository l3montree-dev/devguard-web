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

import { beautifyPurl, classNames } from "@/utils/common";
import { Handle, Position } from "@xyflow/react";
import Link from "next/link";
import { FunctionComponent } from "react";
import { riskToSeverity, severityToColor } from "./common/Severity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useSearchParams } from "next/navigation";
import useDecodedPathname from "../hooks/useDecodedPathname";
import { DependencyVuln } from "../types/api/api";
import { Badge } from "./ui/badge";
import EcosystemImage from "./common/EcosystemImage";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    vuln: DependencyVuln[];
    risk: number;
    nodeWidth: number;
    nodeHeight: number;
    infoSources?: Set<string>;
  };
}

const beautifyInfoSource = (source: string) => {
  if (source.startsWith("sbom:")) {
    // return everything between the first ":" and the "@"
    const atIndex = source.indexOf("@");
    if (atIndex === -1) {
      return source.substring(5);
    }
    return source.substring(5, atIndex);
  }
  if (source.startsWith("vex:")) {
    const atIndex = source.indexOf("@");
    if (atIndex === -1) {
      return source.substring(4);
    }
    return source.substring(4, atIndex);
  }
  if (source.startsWith("csaf:")) {
    const atIndex = source.indexOf("@");
    if (atIndex === -1) {
      return source.substring(5);
    }
    return source.substring(5, atIndex);
  }
  return source;
};

export const DependencyGraphNode: FunctionComponent<
  DependencyGraphNodeProps
> = (props) => {
  const color = severityToColor(riskToSeverity(props.data.risk));
  const searchParams = useSearchParams();
  const pathname = useDecodedPathname();
  const shouldFocus =
    beautifyPurl(searchParams?.get("pkg") as string) ===
    beautifyPurl(props.data.label);

  const hasVulnerabilities = props.data.vuln !== undefined;
  const infoSources = props.data.infoSources
    ? Array.from(props.data.infoSources)
    : [];

  const Node = (
    <div
      style={{
        maxWidth: props.data.nodeWidth,
        borderColor: hasVulnerabilities ? color : undefined,
        boxShadow: hasVulnerabilities
          ? `0 0 0 2px ${color}40`
          : shouldFocus
            ? "0 0 0 2px hsl(var(--primary))"
            : undefined,
      }}
      className={classNames(
        "relative border-2 rounded-lg p-3 text-xs text-card-foreground bg-card transition-all",
        shouldFocus ? "border-primary" : "border-border",
        hasVulnerabilities ? "shadow-lg" : "shadow-md",
      )}
    >
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="target"
        position={Position.Right}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-start gap-2">
          {props.data.label.startsWith("pkg:") && (
            <div className="flex-shrink-0 mt-0.5">
              <EcosystemImage packageName={props.data.label} size={16} />
            </div>
          )}
          {hasVulnerabilities && (
            <span className="relative mt-0.5 flex h-3 w-3">
              <span
                style={{
                  backgroundColor: color,
                }}
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              ></span>
              <span
                style={{
                  backgroundColor: color,
                }}
                className="relative inline-flex h-3 w-3 rounded-full"
              ></span>
            </span>
          )}
          <label htmlFor="text" className="text-left font-medium leading-tight">
            {props.data.label}
          </label>
        </div>
        {infoSources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {infoSources.map((source) => (
              <Badge
                key={source}
                variant="secondary"
                className={classNames(
                  "text-[10px] px-1.5 py-0",
                  source.startsWith("sbom:")
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                )}
              >
                {beautifyInfoSource(source)}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Handle
        className="rounded-full !bg-border !border-2 !border-background !w-3 !h-3"
        type="source"
        position={Position.Left}
        id="a"
      />
    </div>
  );

  if (!props.data.vuln) {
    return Node;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{Node}</DropdownMenuTrigger>
      <DropdownMenuContent className="text-xs">
        {props.data.vuln.map((vuln) => (
          <DropdownMenuItem key={vuln.id}>
            <Link
              className="!text-foreground hover:no-underline"
              href={pathname + `/../../dependency-risks/${vuln.id}`}
            >
              {vuln.cveID}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
