// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
  CreateVexRuleRequest,
  ExternalReference,
  VexRuleRecommendation,
} from "@/types/api/api";
import type { checkCelSyntax } from "@/components/common/celLinter";

export interface VexRuleVulnContext {
  cveID: string | null;
  componentPurl: string;
  // Ordered purls from the direct dependency down to the vulnerable component.
  vulnerabilityPath: string[];
  // Application / asset name rendered as the first (root) node.
  rootName: string;
}

export type VexRuleEffectType =
  | "pathCut"
  | "pathIntact"
  | "attributeMatch"
  | "attributeMiss"
  | "indeterminate";

export interface VexRuleEffect {
  type: VexRuleEffectType;
  // Whether the rule applies to this vulnerability; null when indeterminate.
  applies: boolean | null;
  // Index into `vulnerabilityPath` of the first node the rule dismisses. The cut
  // sits on the edge entering that node; -1 when the rule cuts nothing.
  cutIndex: number;
  // Which attribute an `attributeMatch` / `attributeMiss` was decided on.
  matchedOn?: { field: "cveId" | "componentPurl"; value: string };
}

export type VexSourceType = "cyclonedx" | "csaf";

export type VexSource = ExternalReference & { type: VexSourceType };

export interface VexRuleMatchCount {
  // Syntax error of the current expression, or null when it parses.
  syntaxError?: ReturnType<typeof checkCelSyntax>;
  hasSyntaxError?: boolean;
  // A request is in flight for the current expression.
  isTesting?: boolean;
  // The /test call failed (network, or the backend rejected the expression).
  testingError?: string | null;
  // How many vulnerabilities of this asset the expression matches; null while
  // unknown (empty, invalid or not yet tested).
  matchCount: number | null;
}

export interface RecommendationEntry {
  vulnID: string;
  recommendation: VexRuleRecommendation;
}

export type EditableRule = Pick<
  CreateVexRuleRequest,
  "title" | "celExpression" | "justification"
>;
