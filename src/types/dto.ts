// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";

type Schemas = components["schemas"];

export type AssetDTO = Schemas["dtos.AssetDTO"];
export type Policy =
  Schemas["github_com_l3montree-dev_devguard_database_models.Policy"];
export type JiraIntegrationDTO = Schemas["dtos.JiraIntegrationDTO"];
export type AverageVulnEventsPerWeek = Schemas["dtos.AverageVulnEventsPerWeek"];
export type InviteRequest = Schemas["dtos.InviteRequest"];
export type InstanceSettings = Schemas["dtos.InstanceSettingsDTO"];
export type GitlabOAuth2Config = Schemas["dtos.GitlabOauth2ConfigDTO"];
export type ArtifactDTO = Schemas["dtos.ArtifactDTO"];
export type AssetVersionDTO = Schemas["dtos.AssetVersionDTO"];
export type ReleaseDTO = Schemas["dtos.ReleaseDTO"];
export type CVEDTO = Schemas["dtos.CVEDTO"];
export type OrganizationDTO = Schemas["dtos.OrgDTO"];
export type OrganizationDetailsDTO = Schemas["dtos.OrgDetailsDTO"];
export type AssetDetailsDTO = Schemas["dtos.AssetDetailsDTO"];
export type ProjectDetailsDTO = Schemas["dtos.ProjectDetailsDTO"];
export type AssetDetailsWithSecretsDTO =
  Schemas["dtos.AssetDetailsWithSecretsDTO"];
export type ProjectDTO = Schemas["dtos.ProjectDTO"];
export type CompliancePostureWithControlDTO =
  Schemas["dtos.CompliancePostureWithControlDTO"];
export type ComplianceComponentDetailsDTO =
  Schemas["dtos.ComplianceComponentDetailsDTO"];
export type ComplianceComponentImplementsControlStatementDTO =
  Schemas["dtos.ComplianceComponentImplementsControlStatementDTO"];
export type OrgOverview = Schemas["dtos.OrgOverview"];
export type EcosystemUsageInOrg = Schemas["dtos.EcosystemUsage"];
export type RiskHistory =
  Schemas["github_com_l3montree-dev_devguard_database_models.ArtifactRiskHistory"];
export type DependencyVuln = Schemas["dtos.DependencyVulnDTO"];
export type License = Schemas["licenses.License"];
export type Exploit =
  Schemas["github_com_l3montree-dev_devguard_database_models.Exploit"];
export type ComplianceComponentImplementsControlDTO =
  Schemas["dtos.ComplianceComponentImplementsControlDTO"];
export type InstanceOverview = Schemas["dtos.InstanceOverview"];
export type GitLabIntegrationDTO = Schemas["dtos.GitlabIntegrationDTO"];
export type LicenseRiskDTO =
  Schemas["github_com_l3montree-dev_devguard_database_models.LicenseRisk"];
export type FirstPartyVuln = Schemas["dtos.FirstPartyVulnDTO"];
export type CVEOccurrenceInOrg = Schemas["dtos.CVEOccurrence"];
export type CandidatesDTO = Schemas["dtos.CandidatesResponseDTO"];
export type ComponentUsageInOrg = Schemas["dtos.ComponentOccurrenceAcrossOrg"];
export type ExternalReference = Schemas["dtos.ExternalReferenceDTO"];
export type MinimalDependencyTree = Schemas["normalize.MinimalTree"];
export type Relationship = Schemas["dtos.RelationshipDTO"];
export type RemediationTypeUsage = Schemas["dtos.RemediationTypeDistribution"];
export type WebhookDTO = Schemas["dtos.WebhookIntegrationDTO"];
export type InstanceInfo = Omit<Schemas["dtos.InfoResponse"], "database"> & {
  database: Omit<Schemas["dtos.DatabaseInfo"], "vulndbVersion"> & {
    vulndbVersion?: string;
  };
};
