import { useMemo } from "react";
import {
  minimalTreeToViewDependencyTreeNode,
  recursiveAddRisk,
  recursiveRemoveWithoutRisk,
} from "@/utils/dependencyGraphHelpers";
import { MinimalDependencyTree, DependencyVuln } from "@/types/api/api";

/**
 * Hook that converts a MinimalDependencyTree and affected components into a
 * ViewDependencyTreeNode with computed risks. If `all` is falsy, nodes with
 * no risk are pruned.
 */
export function useDependencyGraph(
  graphData?: MinimalDependencyTree,
  affectedComponents?: DependencyVuln[] | null,
  showAll?: boolean,
) {
  return useMemo(() => {
    if (!graphData) return null;

    const converted = minimalTreeToViewDependencyTreeNode(graphData);
    recursiveAddRisk(converted, affectedComponents ?? []);

    if (!showAll) {
      // prune zero-risk branches
      recursiveRemoveWithoutRisk(converted);
    }

    return converted;
  }, [graphData, affectedComponents, showAll]);
}
