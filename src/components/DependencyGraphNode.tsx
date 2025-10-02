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
import Link from "next/link";
import { useRouter } from "next/compat/router";
import { FunctionComponent } from "react";
import { riskToSeverity, severityToColor } from "./common/Severity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { VulnDTO } from "../types/api/api";
import { useSearchParams } from "next/navigation";
import useDecodedPathname from "../hooks/useDecodedPathname";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    vuln: VulnDTO[];
    risk: number;
    nodeWidth: number;
    nodeHeight: number;
  };
}

export const DependencyGraphNode: FunctionComponent<
  DependencyGraphNodeProps
> = (props) => {
  const color = severityToColor(riskToSeverity(props.data.risk));
  const searchParams = useSearchParams();
  const pathname = useDecodedPathname();
  const shouldFocus =
    beautifyPurl(searchParams?.get("pkg") as string) ===
    beautifyPurl(props.data.label);
  const router = useRouter();
  const version = extractVersion(props.data.label);
  const Node = (
    <div
      style={{
        maxWidth: props.data.nodeWidth,
        borderColor: props.data.vuln !== undefined ? color : undefined,
        // backgroundColor: props.data.vuln !== undefined ? color : "white",
      }}
      className={classNames(
        "relative rounded border bg-card p-3 text-xs text-card-foreground",
        shouldFocus ? "border-2 border-primary" : "",
      )}
    >
      <Handle
        className="rounded-full"
        type="target"
        position={Position.Right}
      />
      <div className="flex flex-row items-start gap-2">
        {props.data.vuln && (
          <span className="relative mt-0.5 flex h-3 w-3">
            <span
              style={{
                backgroundColor: color,
              }}
              className="absolute inline-flex h-full w-full animate-ping rounded-full  opacity-75"
            ></span>
            <span
              style={{
                backgroundColor: color,
              }}
              className="relative inline-flex h-3 w-3 rounded-full"
            ></span>
          </span>
        )}
        <label htmlFor="text" className="text-left">
          {beautifyPurl(props.data.label)}
          {version ? `@${version}` : ""}
        </label>
      </div>
      <Handle
        className="rounded-full"
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
