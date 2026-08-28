// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { Modify } from "@/types/common";
import type { DependencyVuln, Exploit, Relationship } from "@/types/dto";
import type { CVE, CWE } from "@/types/view/cvss";

export interface VulnByPackage {
  packageName: string;
  maxRisk: number;
  maxCvss: number;
  totalRisk: number;
  vulnCount: number;
  avgRisk: number;
  vulns: Array<VulnWithCVE>;
}

// the DTO types cve as always present; the list endpoint omits it for vulns
// whose CVE was not resolved, and the frontend needs the richer nested shape
export type VulnWithCVE = Omit<DependencyVuln, "cve"> & {
  cve?: Modify<
    CVE,
    {
      cwes: Array<CWE>;
    }
  > & {
    risk: {
      baseScore: number;
      withEnvironment: number;
      withThreatIntelligence: number;
      withEnvironmentAndThreatIntelligence: number;
    };
    exploits: Array<Exploit>;
    relationships: Array<Relationship>;
  };
};

export type MechanicalJustificationType =
  | "component_not_present"
  | "vulnerable_code_not_present"
  | "vulnerable_code_not_in_execute_path"
  | "vulnerable_code_cannot_be_controlled_by_adversary"
  | "inline_mitigations_already_exist";

export enum UserRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
  Guest = "guest",

  Unknown = "unknown",
}

export interface AverageFixingTime {
  averageFixingTimeSeconds: number;
  averageFixingTimeSecondsByCvss: number;
}
