// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { checkCelSyntax } from "@/components/common/celLinter";
import type { components } from "@/types/api/generated";
import type { ExternalReference } from "@/types/dto";
import type { MechanicalJustificationType } from "@/types/view/vuln";

type S = components["schemas"];

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

export type VexSourceType = "cyclonedx" | "csaf" | "openvex";

export const isVexSourceType = (type: string): type is VexSourceType =>
  type === "cyclonedx" || type === "csaf" || type === "openvex";

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

export type EditableRule = Pick<
  CreateVexRuleRequest,
  "title" | "celExpression" | "justification"
>;

export type VexRulePrefill = {
  celExpression: string;
  title?: string;
  justification?: string;
  mechanicalJustification?: MechanicalJustificationType;
  wasRecommended?: boolean;
};

// The DTO types eventType as the full VulnEventType union; a VEX rule can only
// ever carry one of these three.
export type VexRuleEventType = "accepted" | "falsePositive" | "reopened";

export type VexRule = Omit<S["dtos.VEXRuleDTO"], "eventType"> & {
  eventType: VexRuleEventType;
};

// mechanicalJustification and wasRecommended are optional in practice: the Go
// struct has no validate:"required" on either.
export type CreateVexRuleRequest = Omit<
  S["dtos.CreateVEXRuleRequest"],
  "eventType" | "mechanicalJustification" | "wasRecommended"
> & {
  eventType: VexRuleEventType;
  mechanicalJustification?: S["dtos.MechanicalJustificationType"];
  wasRecommended?: boolean;
};

// A rule other DevGuard organizations already apply to this vulnerability,
// picked by trust-weighted agreement (crowdsourced vexing). Not a rule of this
// asset yet - it becomes one once accepted.
export type VexRuleRecommendation = Omit<
  S["dtos.VexRuleRecommendation"],
  "eventType" | "assetSlug" | "projectSlug"
> & {
  eventType: VexRuleEventType;
  // set only when the recommendation came from an asset the user can already
  // reach, so the frontend can link to it
  assetSlug?: string;
  projectSlug?: string;
};
