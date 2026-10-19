// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";

type Schemas = components["schemas"];

export type AssetDTO = Schemas["dtos.Asset"];
export type JiraIntegrationDTO = Schemas["dtos.JiraIntegration"];
export type RedmineIntegrationDTO = Schemas["dtos.RedmineIntegration"];
export type RedmineIntegrationPropertiesDTO =
  Schemas["dtos.RedmineIntegrationProperties"];
export type RedmineTrackerDTO = Schemas["dtos.RedmineTracker"];
export type RedmineStatusDTO = Schemas["dtos.RedmineStatus"];
export type RedminePriorityDTO = Schemas["dtos.RedminePriority"];
export type AverageVulnEventsPerWeek = Schemas["dtos.AverageVulnEventsPerWeek"];
export type InviteRequest = Schemas["dtos.InviteRequest"];
export type InstanceSettings = Schemas["dtos.InstanceSettings"];
export type GitlabOAuth2Config = Schemas["dtos.GitlabOauth2Config"];
export type ArtifactDTO = Schemas["dtos.Artifact"];
export type AssetVersionDTO = Schemas["dtos.AssetVersion"];
export type ReleaseDTO = Schemas["dtos.Release"];
export type CVEDTO = Schemas["dtos.CVE"];
export type OrganizationDTO = Schemas["dtos.Org"];
export type OrganizationDetailsDTO = Schemas["dtos.OrgDetails"];
export type AssetDetailsDTO = Schemas["dtos.AssetDetails"];
export type ProjectDetailsDTO = Schemas["dtos.ProjectDetails"];
export type AssetDetailsWithSecretsDTO =
  Schemas["dtos.AssetDetailsWithSecrets"];
export type ProjectDTO = Schemas["dtos.Project"];
export type CompliancePostureWithControlDTO =
  Schemas["dtos.CompliancePostureWithControl"];
export type ComplianceComponentDetailsDTO =
  Schemas["dtos.ComplianceComponentDetails"];
export type ComplianceComponentImplementsControlStatementDTO =
  Schemas["dtos.ComplianceComponentImplementsControlStatement"];
export type OrgOverview = Schemas["dtos.OrgOverview"];
export type EcosystemUsageInOrg = Schemas["dtos.EcosystemUsage"];
export type RiskHistory =
  Schemas["github_com_l3montree-dev_devguard_database_models.ArtifactRiskHistory"];
export type DependencyVuln = Schemas["dtos.DependencyVuln"];
export type License = Schemas["licenses.License"];
export type Exploit =
  Schemas["github_com_l3montree-dev_devguard_database_models.Exploit"];
export type ComplianceComponentImplementsControlDTO =
  Schemas["dtos.ComplianceComponentImplementsControl"];
export type InstanceOverview = Schemas["dtos.InstanceOverview"];
export type GitLabIntegrationDTO = Schemas["dtos.GitlabIntegration"];
export type LicenseRiskDTO =
  Schemas["github_com_l3montree-dev_devguard_database_models.LicenseRisk"];
export type FirstPartyVuln = Schemas["dtos.FirstPartyVuln"];
export type CVEOccurrenceInOrg = Schemas["dtos.CVEOccurrence"];
export type CandidatesDTO = Schemas["dtos.CandidatesResponse"];
export type ComponentUsageInOrg = Schemas["dtos.ComponentOccurrenceAcrossOrg"];
export type ExternalReference = Schemas["dtos.ExternalReference"];
export type Relationship = Schemas["dtos.Relationship"];
export type RemediationTypeUsage = Schemas["dtos.RemediationTypeDistribution"];
export type WebhookDTO = Schemas["dtos.WebhookIntegration"];
export type InstanceInfo = Omit<Schemas["dtos.InfoResponse"], "database"> & {
  database: Omit<Schemas["dtos.DatabaseInfo"], "vulndbVersion"> & {
    vulndbVersion?: string;
  };
};
