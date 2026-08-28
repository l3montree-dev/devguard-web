// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type MenuType = "edge" | "node" | null;

export interface ContextMenuState {
  type: MenuType;
  x: number;
  y: number;
  childIndex?: number;
  // Full path suffix from the clicked position to the leaf
  path: string[];
}

// VEX justification options
export type VexSelection =
  | {
      type: "edge";
      justification: string;
      // this is the index of the child in the path
      childIndex: number;
      path: string[]; // full path from parent to child, used for rule creation
    }
  | {
      type: "node";
      justification: string;
      path: string[]; // suffix from the clicked node to the leaf
    };

export interface EdgeMaps {
  childToParentEdges: Map<string, Array<{ parent: string; edgeId: string }>>;
  parentToChildEdges: Map<string, Array<{ child: string; edgeId: string }>>;
}

export interface ViewDependencyTreeNode extends Omit<
  DependencyTreeNode,
  "children"
> {
  id: string;
  risk: number;
  parents: Array<ViewDependencyTreeNode>;
  children: ViewDependencyTreeNode[];
  nodeType: "root" | "artifact" | "component" | "infosource";
  infoSourceType?: "sbom" | "csaf" | "vex";
  // Optional flag that marks nodes participating in a cycle. Used to avoid infinite recursion and for UI highlighting.
  hasCycle?: boolean;
}

export interface DependencyTreeNode {
  name: string;
  children: DependencyTreeNode[];
}
