// Copyright (C) 2023 Tim Bastin, l3montree GmbH
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

export interface PolicyEvaluation extends Policy {
  compliant: boolean | null;
  violations: Array<string> | null;
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  predicateType: string;
  organizationId: string | null; // null if community managed
  rego: string;
}

export interface InviteRequest {
  email: string;
}

export enum UserRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
  Guest = "guest",
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

export interface JiraIntegrationDTO {
  id: string;
  obfuscatedToken: string;
  url: string;
  name: string;
  userEmail: string;
}

export interface WebhookDTO {
  id: string;
  name: string;
  description: string;
  url: string;
  secret: string;
  sbomEnabled: boolean;
  vulnEnabled: boolean;
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
  jiraIntegrations: Array<JiraIntegrationDTO>;

  webhooks: Array<WebhookDTO>;

  isPublic: boolean;

  externalEntityProviderId?: "opencode" | "github" | "gitlab";
}

export interface OrganizationDetailsDTO extends OrganizationDTO {
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: UserRole.Owner | UserRole.Admin | UserRole.Member;
  }>;
  oauth2Error?: boolean;
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
  avatar?: string;
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

  webhooks: Array<WebhookDTO>;

  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: UserRole.Admin | UserRole.Member;
  }>;

  externalEntityId?: string;
  externalEntityProviderId?: string;
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
  cveID: string | null;
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
  vulnType: "dependencyVuln" | "firstPartyVuln";
  justification: string;
  mechanicalJustification: string;
  vulnerabilityName: string | null;
  assetVersionName: string;
  arbitraryJSONData: EventArbitraryJsonData;
  packageName: string | null;
  uri: string | null;
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
  arbitraryJSONData: EventArbitraryJsonData & RiskCalculationReport;
}

export interface AddedScannerEventDTO extends BaseVulnEventDTO {
  type: "addedScanner";
  arbitraryJSONData: EventArbitraryJsonData & {
    scannerIds: string;
  };
}

export interface RemovedScannerEventDTO extends BaseVulnEventDTO {
  type: "removedScanner";
  arbitraryJSONData: EventArbitraryJsonData & {
    scannerIds: string;
  };
}

export interface DetectedOnAnotherBranchEventDTO extends BaseVulnEventDTO {
  type: "detectedOnAnotherBranch";
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
  | RemovedScannerEventDTO
  | DetectedOnAnotherBranchEventDTO
  | LicenseDecisionEventDTO;

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

export interface DependencyVulnHints {
  amountOpen: number;
  amountFixed: number;
  amountAccepted: number;
  amountFalsePositive: number;
  amountMarkedForTransfer: number;
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

  avatar?: string;
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

  badgeSecret: string;
  webhookSecret: string | null;

  externalEntityId?: string;
  externalEntityProviderId?: string;

  vulnAutoReopenAfterDays?: number;
  repositoryProvider?: "github" | "gitlab";
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
  [component: string]: {
    low: number;
    medium: number;
    high: number;
    critical: number;

    lowCvss: number;
    mediumCvss: number;
    highCvss: number;
    criticalCvss: number;
  };
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

  low: number;
  medium: number;
  high: number;
  critical: number;

  lowCvss: number;
  mediumCvss: number;
  highCvss: number;
  criticalCvss: number;

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
  vulnCount: number;
  avgRisk: number;
  vulns: VulnWithCVE[];
}

export interface LicenseRiskDTO {
  id: string;
  scannerIds: string;
  message: null;
  assetVersionName: string;
  assetId: string;
  state: string;
  createdAt: string;
  ticketId: string | null;
  ticketUrl: string | null;
  manualTicketCreation: boolean;
  finalLicenseDecision?: string;
  componentPurl: string;

  component: {
    purl: string;
    version: string;
    license: string;
  };
}

export interface DetailedLicenseRiskDTO extends LicenseRiskDTO {
  events: VulnEventDTO[];
}

interface snippetContents {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  snippet: string;
}

export interface FirstPartyVuln extends BaseVulnDTO {
  uri: string;

  snippetContents: snippetContents[];

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
  isLicenseOverwritten?: boolean;
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

export interface AverageFixingTime {
  averageFixingTimeSeconds: number;
}
