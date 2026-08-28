// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export type CvssMetric = {
  key: string;
  field?: string;
  label: string;
  group?: string;
  options: { v: string; l: string }[];
  description?: string;
};

export interface RiskCalculationReport {
  epss: number;
  baseScore: number;
  exploitExists: boolean;
  verifiedExploitExists: boolean;
  underAttack: boolean;
  confidentialityRequirement: string;
  integrityRequirement: string;
  availabilityRequirement: string;
  risk: number;
  oldRisk?: number;
}

export interface CVE {
  attackComplexity: string;
  attackVector: string;
  availabilityImpact: string;
  confidentialityImpact: string;
  createdAt: string;
  cve: string;
  cvss: number;
  cwes: null;
  dateLastModified: string;
  datePublished: string;
  description: string;
  exploitabilityScore: number;
  fixAvailable: null;
  impactScore: number;
  integrityImpact: string;
  privilegesRequired: string;
  scope: string;
  severity: string;
  userInteractionRequired: string;
  epss: number;

  cisaExploitAdd?: string;
  cisaActionDue?: string;
  cisaRequiredAction?: string;
  cisaVulnerabilityName?: string;
  euvdExploitAdd?: string;

  vector?: string;
}

export interface CWE {
  cwe: string;
  description: string;
}
