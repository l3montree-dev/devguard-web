// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { FlawDTO } from "@/types/api/api";
import { Handle, Position } from "@xyflow/react";
import { FunctionComponent } from "react";
import { classNames } from "@/utils/common";
import Link from "next/link";
import { useRouter } from "next/router";
import { riskToSeverity, severityToColor } from "./common/Severity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface DependencyGraphNodeProps {
  data: {
    label: string;
    flaw: FlawDTO;
    risk: number;
  };
}

const riskToTextColor = (risk: number) => {
  if (risk > 4) {
    return "black";
  }
  return "white";
};

export const DependencyGraphNode: FunctionComponent<
  DependencyGraphNodeProps
> = (props) => {
  const color = severityToColor(riskToSeverity(props.data.risk));
  const shouldFocus = useRouter().query.pkg === props.data.label;
  const router = useRouter();
  const Node = (
    <div
      style={{
        maxWidth: 300,
        borderColor: props.data.flaw !== undefined ? color : undefined,
        //backgroundColor: props.data.flaw !== undefined ? color : "white",
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
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="text">{props.data.label}</label>
      </div>
      <Handle
        className="rounded-full"
        type="source"
        position={Position.Left}
        id="a"
      />
    </div>
  );

  if (!props.data.flaw) {
    return Node;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{Node}</DropdownMenuTrigger>
      <DropdownMenuContent className="text-xs">
        <div className="p-2">{props.data.flaw.cveId}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            className="!text-foreground hover:no-underline"
            href={
              router.asPath.split("?")[0] + `/../flaws/${props.data.flaw.id}`
            }
          >
            Go to risk assessment
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
