// Copyright (C) 2023 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { Modify } from "../common";

export enum RequirementsLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
interface AppModelDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDTO extends AppModelDTO {
  name: string;
  contactPhoneNumber?: string;
  numberOfEmployees?: number;
  country?: string;
  industry?: string;
  criticalInfrastructure: boolean;
  iso27001: boolean;
  nist: boolean;
  grundschutz: boolean;
  slug: string;
  description: string;
}

export interface PersonalAccessTokenDTO {
  description: string;
  userId: string;
  createdAt: string;
  id: string;
  token: string;
}

export interface ProjectDTO {
  name: string;
  description: string;
  slug: string;
  id: string;
}

export interface EnvDTO {
  name: string;
  description: string;
  slug: string;
  id: string;
  position: number;
  lastReportTime: string;
}

export interface FlawDTO {
  message: string | null;
  ruleId: string;
  level: string | null;
  id: string;
  createdAt: string;
  updatedAt: string;
  cveId: string | null;

  state:
    | "open"
    | "fixed"
    | "accepted"
    | "falsePositive"
    | "markedForMitigation"
    | "markedForTransfer";

  priority: number | null; // will be null, if not prioritized yet.
  rawRiskAssessment: number;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FlawEventDTO {
  type:
    | "fixed"
    | "detected"
    | "accepted"
    | "falsePositive"
    | "markedForMitigation"
    | "markedForTransfer";
  userId: string;
  createdAt: string;
  id: string;
  flawId: string;
  justification: string;
}

export interface CWE {
  cwe: string;
  description: string;
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
}
export interface FlawWithCVE extends FlawDTO {
  cve: Modify<
    CVE,
    {
      cwes: Array<CWE>;
    }
  > | null;
  arbitraryJsonData: {
    packageName?: string;
  };
  component: {
    purlOrCpe: string;
  };
}

export interface DetailedFlawDTO extends FlawWithCVE {
  events: FlawEventDTO[];
}

export interface AssetDTO {
  name: string;
  description: string;
  slug: string;
  id: string;

  confidentialityRequirement: RequirementsLevel;
  integrityRequirement: RequirementsLevel;
  availabilityRequirement: RequirementsLevel;
}

export interface DependencyTreeNode {
  name: string;
  children: DependencyTreeNode[];
}

export interface AffectedPackage {
  CVE: CVE;
  CVEID: string;
  FixedVersion: string;
  IntroducedVersion: string;
  PackageName: string;
  PurlWithVersion: string;
}
