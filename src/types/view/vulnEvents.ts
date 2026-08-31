// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { RiskCalculationReport } from "@/types/view/cvss";

import type { components } from "@/types/api/generated";
import type { VexRule } from "@/types/view/vexRules";

type S = components["schemas"];

interface EventArbitraryJsonData {
  scannerIds: string;
}

interface BaseVulnEventDTO {
  userId: string;
  createdAt: string;
  id: string;
  vulnId: string;
  vulnType:
    | "dependencyVuln"
    | "firstPartyVuln"
    | "compliancePosture"
    | "securityAdvisory";
  justification: string;
  mechanicalJustification: string;
  vulnerabilityName: string | null;
  originalAssetVersionName: string;
  packageName: string | null;
  uri: string | null;
  createdByVexRule: boolean;
  userAgent: string;
  vexRuleId?: string | null;
  vexRule?: VexRule | null;
}

export interface ImplementedEventDTO extends BaseVulnEventDTO {
  type: "implemented";
}

export interface NotApplicableEventDTO extends BaseVulnEventDTO {
  type: "notApplicable";
}

export interface AcceptedEventDTO extends BaseVulnEventDTO {
  type: "accepted";
}

export interface ReopenedEventDTO extends BaseVulnEventDTO {
  type: "reopened";
}

export interface FixedEventDTO extends BaseVulnEventDTO {
  type: "fixed";
}

export interface DetectedEventDTO extends BaseVulnEventDTO {
  type: "detected";
  arbitraryJSONData: EventArbitraryJsonData & RiskCalculationReport;
}

export interface FalsePositiveEventDTO extends BaseVulnEventDTO {
  type: "falsePositive";
}

export interface MitigateEventDTO extends BaseVulnEventDTO {
  type: "mitigate";
  arbitraryJSONData: EventArbitraryJsonData & {
    ticketUrl: string;
    ticketId: string;
  };
}

export interface MarkedForTransferEventDTO extends BaseVulnEventDTO {
  type: "markedForTransfer";
}

export interface RiskAssessmentUpdatedEventDTO extends BaseVulnEventDTO {
  type: "rawRiskAssessmentUpdated";
  arbitraryJSONData: EventArbitraryJsonData & RiskCalculationReport;
}

export interface CommentEventDTO extends BaseVulnEventDTO {
  type: "comment";
}

export interface LicenseDecisionEventDTO extends BaseVulnEventDTO {
  type: "licenseDecision";
  arbitraryJSONData: EventArbitraryJsonData & {
    finalLicenseDecision?: string;
    license?: string;
  };
}

export interface AttachedComplianceComponentEventDTO extends BaseVulnEventDTO {
  type: "attachedComplianceComponent";
  arbitraryJSONData: EventArbitraryJsonData & {
    componentTitle: string;
  };
}

export interface RemovedComplianceComponentEventDTO extends BaseVulnEventDTO {
  type: "removedComplianceComponent";
  arbitraryJSONData: EventArbitraryJsonData & {
    componentTitle: string;
  };
}

export interface PublishedEventDTO extends BaseVulnEventDTO {
  type: "published";
}

export interface WithdrawnEventDTO extends BaseVulnEventDTO {
  type: "withdrawn";
}

export interface CreatedEventDTO extends BaseVulnEventDTO {
  type: "created";
}

export type VulnEventDTO =
  | AcceptedEventDTO
  | FixedEventDTO
  | DetectedEventDTO
  | FalsePositiveEventDTO
  | MitigateEventDTO
  | MarkedForTransferEventDTO
  | RiskAssessmentUpdatedEventDTO
  | ReopenedEventDTO
  | CommentEventDTO
  | LicenseDecisionEventDTO
  | ImplementedEventDTO
  | NotApplicableEventDTO
  | AttachedComplianceComponentEventDTO
  | RemovedComplianceComponentEventDTO
  | PublishedEventDTO
  | WithdrawnEventDTO
  | CreatedEventDTO;

export type DetailedDependencyVulnDTO = Omit<
  S["dtos.DetailedDependencyVulnWithRelationsDTO"],
  "events"
> & { events: VulnEventDTO[] };

export type DetailedLicenseRiskDTO = Omit<
  S["dtos.DetailedLicenseRiskDTO"],
  "events"
> & { events: VulnEventDTO[] };

export type DetailedFirstPartyVulnDTO = Omit<
  S["dtos.DetailedFirstPartyVulnDTO"],
  "events"
> & { events: VulnEventDTO[] };

// `additional` is free-form control metadata in Go, so the spec types it as an
// empty object; the UI probes well-known keys on it.
export type DetailedComplianceRiskDTO = Omit<
  S["dtos.CompliancePostureWithDetailsDTO"],
  "events" | "additional"
> & {
  events: VulnEventDTO[];
  additional: Record<string, any>;
};
