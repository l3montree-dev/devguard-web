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
// You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { DependencyTreeNode } from "../api/api";

export interface ViewDependencyTreeNode
  extends Omit<DependencyTreeNode, "children"> {
  risk: number;
  parent: ViewDependencyTreeNode | null;
  children: ViewDependencyTreeNode[];
  nodeType: "root" | "artifact" | "component" | "infosource";
  infoSourceType?: "sbom" | "csaf" | "vex";
}

export const pathEntryToViewNode = (entry: string): ViewDependencyTreeNode => {
  const parts = entry.split(":");
  let nodeType: "root" | "artifact" | "component" | "infosource";
  let infoSourceType: "sbom" | "csaf" | "vex" | undefined = undefined;
  if (parts.length === 2) {
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
  } else {
    nodeType = "root";
  }
  return {
    name: entry,
    children: [],
    risk: 0,
    parent: null,
    nodeType,
    infoSourceType,
  };
};
