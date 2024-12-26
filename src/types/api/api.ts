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

export interface InviteRequest {
  email: string;
}
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

export interface AssetMetricsDTO {
  enabledImageSigning: boolean;
  verifiedSupplyChainsPercentage: number;
  enabledContainerScanning: boolean;
  enabledSCA: boolean;
}

export interface GitLabIntegrationDTO {
  id: string;
  obfuscatedToken: string;
  url: string;
  name: string;
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

  githubAppInstallations: Array<{
    installationId: number;
    settingsUrl: string;

    targetType: string;
    targetLogin: string;
    targetAvatarUrl: string;
  }>;

  gitLabIntegrations: Array<GitLabIntegrationDTO>;

  isPublic: boolean;
}

export interface OrganizationDetailsDTO extends OrganizationDTO {
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: "owner" | "member" | "admin";
  }>;
}

export interface PersonalAccessTokenDTO {
  description: string;
  userId: string;
  createdAt: string;
  id: string;
  pubKey: string;
  fingerprint: string;
}

export interface PatWithPrivKey extends PersonalAccessTokenDTO {
  privKey: string;
}

export interface ProjectDTO {
  name: string;
  description?: string;
  slug: string;
  id: string;

  isPublic: boolean;

  parentId: string | null;
  parent: ProjectDTO | null;

  type: "default" | "kubernetesNamespace";
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
  componentPurl: string | null;
  scanner: string;
  state: "open" | "fixed" | "accepted" | "falsePositive" | "markedForTransfer";
  priority: number | null; // will be null, if not prioritized yet.
  rawRiskAssessment: number;
  ticketId: string | null;
  ticketUrl: string | null;
  riskRecalculatedAt: string;
  assetId: string;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

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
}

interface BaseFlawEventDTO {
  userId: string;
  createdAt: string;
  id: string;
  flawId: string;
  justification: string;
  flawName: string | null;
}

export interface AcceptedFlawEventDTO extends BaseFlawEventDTO {
  type: "accepted";
}

export interface ReopenedFlawEventDTO extends BaseFlawEventDTO {
  type: "reopened";
}

export interface FixedFlawEventDTO extends BaseFlawEventDTO {
  type: "fixed";
}

export interface DetectedFlawEventDTO extends BaseFlawEventDTO {
  type: "detected";
  arbitraryJsonData: RiskCalculationReport;
}

export interface FalsePositiveFlawEventDTO extends BaseFlawEventDTO {
  type: "falsePositive";
}

export interface MitigateFlawEventDTO extends BaseFlawEventDTO {
  type: "mitigate";
  arbitraryJsonData: {
    ticketUrl: string;
    ticketId: string;
  };
}

export interface MarkedForTransferFlawEventDTO extends BaseFlawEventDTO {
  type: "markedForTransfer";
}

export interface RiskAssessmentUpdatedFlawEventDTO extends BaseFlawEventDTO {
  type: "rawRiskAssessmentUpdated";
  arbitraryJsonData: RiskCalculationReport;
}

export interface CommentFlawEventDTO extends BaseFlawEventDTO {
  type: "comment";
}

export type FlawEventDTO =
  | AcceptedFlawEventDTO
  | FixedFlawEventDTO
  | DetectedFlawEventDTO
  | FalsePositiveFlawEventDTO
  | MitigateFlawEventDTO
  | MarkedForTransferFlawEventDTO
  | RiskAssessmentUpdatedFlawEventDTO
  | ReopenedFlawEventDTO
  | CommentFlawEventDTO;

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

  vector?: string;
}

export interface Exploit {
  id: string;
  pushed_at: string;
  updated_at: string;
  author: string;
  type: string;
  verified: boolean;
  sourceURL: string;
  description: string;
  cveID: string;
  tags: string;
  forks: number;
  watchers: number;
  subscribers_count: number;
  stargazers_count: number;
}
export interface FlawWithCVE extends FlawDTO {
  cve:
    | (Modify<
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
      })
    | null;
  arbitraryJsonData: null | {
    introducedVersion: string;
    fixedVersion: string;
    packageName: string;
    installedVersion: string;
    cveId: string;
    scanType: string;
    componentDepth: number;
  };
  component: {
    componentType: "application" | "library";
    purlOrCpe: string;
  };
}

export interface DetailedFlawDTO extends FlawWithCVE {
  events: FlawEventDTO[];
}

export interface AssetDTO {
  name: string;
  description?: string;
  slug: string;
  id: string;

  confidentialityRequirement: RequirementsLevel;
  integrityRequirement: RequirementsLevel;
  availabilityRequirement: RequirementsLevel;

  repositoryId?: string;
  repositoryName?: string;

  reachableFromTheInternet: boolean;

  lastSecretScan: string;
  lastSastScan: string;
  lastScaScan: string;
  lastIacScan: string;
  lastContainerScan: string;
  lastDastScan: string;

  signingPubKey?: string;
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

export interface ComponentRisk {
  [component: string]: number;
}

export interface RiskDistribution {
  id: string;
  label: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface RiskHistory {
  id: string;
  day: string;
  sumOpenRisk: number;
  averageOpenRisk: number;
  maxOpenRisk: number;
  minOpenRisk: number;

  sumClosedRisk: number;
  averageClosedRisk: number;
  maxClosedRisk: number;
  minClosedRisk: number;

  openFlaws: number;
  fixedFlaws: number;
}

export interface FlawCountByScanner {
  [scannerId: string]: number;
}

export interface DependencyCountByScanType {
  [scanType: string]: number;
}

export interface FlawAggregationStateAndChange {
  was: {
    open: number;
    fixed: number;
  };
  now: {
    open: number;
    fixed: number;
  };
}

export interface FlawByPackage {
  packageName: string;
  maxRisk: number;
  totalRisk: number;
  flawCount: number;
  avgRisk: number;
  flaws: FlawWithCVE[];
}

export interface AverageFixingTime {
  averageFixingTimeSeconds: number;
}
