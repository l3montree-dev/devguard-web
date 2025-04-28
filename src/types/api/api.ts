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

export interface PolicyEvaluation {
  result: boolean | null;
  title: string;
  description: string;
  tags: Array<string>;
  relatedResources: Array<string>;
  complianceFrameworks: Array<string>;
  priority: number;
}

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
  scopes: string;

  userId: string;
  createdAt: string;
  id: string;
  pubKey: string;
  fingerprint: string;
  lastUsedAt: string | null;
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

  type: "default" | "kubernetesNamespace" | "kubernetesCluster";

  repositoryId?: string;
  repositoryName?: string;

  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: "member" | "admin";
  }>;
}

export interface EnvDTO {
  name: string;
  description: string;
  slug: string;
  id: string;
  position: number;
  lastReportTime: string;
}

export interface ScaVulnDTO extends DependencyVuln {
  componentFixedVersion: string | null;
  componentDepth: number;
  componentPurl: string;
}

export interface BaseVulnDTO {
  message: string | null;
  ruleId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  state: "open" | "fixed" | "accepted" | "falsePositive" | "markedForTransfer";
  priority: number | null; // will be null, if not prioritized yet.
  ticketId: string | null;
  ticketUrl: string | null;
  assetId: string;
  assetVersionName: string;
  scannerIds: string;
}
export interface DependencyVuln extends BaseVulnDTO {
  level: string | null;
  cveId: string | null;
  priority: number | null; // will be null, if not prioritized yet.
  rawRiskAssessment: number;
  riskRecalculatedAt: string;
}

export type VulnDTO = ScaVulnDTO;

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
  oldRisk?: number;
}
interface EventArbitraryJsonData {
  scannerIds: string;
}
interface BaseVulnEventDTO {
  userId: string;
  createdAt: string;
  id: string;
  vulnId: string;
  justification: string;
  vulnerabilityName: string | null;
  assetVersionName: string;
  assetVersionSlug: string;
  arbitraryJsonData: EventArbitraryJsonData;
}

export interface TicketClosedEventDTO extends BaseVulnEventDTO {
  type: "ticketClosed";
}

export interface TickedDeletedEventDTO extends BaseVulnEventDTO {
  type: "ticketDeleted";
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
  arbitraryJsonData: EventArbitraryJsonData & RiskCalculationReport;
}

export interface AddedScannerEventDTO extends BaseVulnEventDTO {
  type: "addedScanner";
  arbitraryJsonData: EventArbitraryJsonData & {
    scannerIds: string;
  };
}

export interface RemovedScannerEventDTO extends BaseVulnEventDTO {
  type: "removedScanner";
  arbitraryJsonData: EventArbitraryJsonData & {
    scannerIds: string;
  };
}

export interface FalsePositiveEventDTO extends BaseVulnEventDTO {
  type: "falsePositive";
}

export interface MitigateEventDTO extends BaseVulnEventDTO {
  type: "mitigate";
  arbitraryJsonData: EventArbitraryJsonData & {
    ticketUrl: string;
    ticketId: string;
  };
}

export interface MarkedForTransferEventDTO extends BaseVulnEventDTO {
  type: "markedForTransfer";
}

export interface RiskAssessmentUpdatedEventDTO extends BaseVulnEventDTO {
  type: "rawRiskAssessmentUpdated";
  arbitraryJsonData: EventArbitraryJsonData & RiskCalculationReport;
}

export interface CommentEventDTO extends BaseVulnEventDTO {
  type: "comment";
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
  | TicketClosedEventDTO
  | TickedDeletedEventDTO
  | AddedScannerEventDTO
  | RemovedScannerEventDTO;

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
export interface VulnWithCVE extends ScaVulnDTO {
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
}

export interface DetailedDependencyVulnDTO extends VulnWithCVE {
  events: VulnEventDTO[];
}

export interface DetailedFirstPartyVulnDTO extends FirstPartyVuln {
  events: VulnEventDTO[];
}

export interface AssetVersionDTO {
  id: string;
  name: string;
  slug: string;

  assetId: string;
  createdAt: string;
  updatedAt: string;
  version: string;

  defaultBranch: boolean;

  type: "branch" | "tag";

  repositoryId?: string;
  repositoryName?: string;

  lastSecretScan: string;
  lastSastScan: string;
  lastScaScan: string;
  lastIacScan: string;
  lastContainerScan: string;
  lastDastScan: string;

  signingPubKey?: string;
}
export interface AssetDTO {
  name: string;
  description?: string;
  slug: string;
  id: string;

  refs: AssetVersionDTO[];

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

  enableTicketRange: boolean;
  centralVulnManagement: boolean;
  cvssAutomaticTicketThreshold: number | null;
  riskAutomaticTicketThreshold: number | null;
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

export interface License {
  reference?: string;
  isDeprecatedLicenseId?: boolean;
  detailsUrl?: string;
  referenceNumber?: number;
  name: string;
  licenseId: string;
  seeAlso: string[];
  isOsiApproved: boolean;
}

export interface LicenseResponse {
  license: License;
  count: number;
}

export interface RiskDistribution {
  assetId: string;
  assetVersionName: string;
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

  openVulns: number;
  fixedVulns: number;
}

export interface VulnCountByScanner {
  [scannerId: string]: number;
}

export interface DependencyCountByscanner {
  [scanner: string]: number;
}

export interface VulnAggregationStateAndChange {
  was: {
    open: number;
    fixed: number;
  };
  now: {
    open: number;
    fixed: number;
  };
}

export interface VulnByPackage {
  packageName: string;
  maxRisk: number;
  maxCvss: number;
  totalRisk: number;
  flawCount: number;
  avgRisk: number;
  vulns: VulnWithCVE[];
}

export interface FirstPartyVuln extends BaseVulnDTO {
  uri: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  snippet: string;

  ruleHelp: string;
  ruleName: string;
  ruleHelpUri: string;
  ruleDescription: string;
  ruleProperties: any;
}

export interface AverageFixingTime {
  averageFixingTimeSeconds: number;
}

export interface ComponentPaged {
  id: string;
  dependency: Component;
  dependencyPurl: string;
  assetVersionId: string;
  scannerIds: string;
}

export interface Component {
  purl: string;
  dependsOn: any;
  componentType: string;
  version: string;
  license?: string;
  project?: Project;
  projectId: string;
  published?: string;
}

export interface Project {
  projectKey: string;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  homepage: string;
  license: string;
  description: string;
  scoreCard: ScoreCard;
  updatedAt: string;
  scoreCardScore?: number;
}

export interface ScoreCard {
  checks: Check[];
  date: string;
  metadata: any[];
  overallScore: number;
  repository: Repository;
  scorecard: Scorecard;
}

export interface Check {
  details: string[];
  documentation: Documentation;
  name: string;
  reason: string;
  score: number;
}

export interface Documentation {
  shortDescription: string;
  url: string;
}

export interface Repository {
  commit: string;
  name: string;
}

export interface Scorecard {
  commit: string;
  version: string;
}
