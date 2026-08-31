// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

const DEPENDENCY_VULNS =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/dependency-vulns" as const;
const FIRST_PARTY_VULNS =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/first-party-vulns" as const;

const DEPENDENCY_VULN =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/dependency-vulns/{dependencyVulnID}" as const;
const FIRST_PARTY_VULN =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/first-party-vulns/{firstPartyVulnID}" as const;
const LICENSE_RISK =
  "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/license-risks/{licenseRiskID}" as const;

export type CreateEventRequest =
  components["schemas"]["dtos.CreateEventRequest"];
export type FirstPartyVulnStatus =
  components["schemas"]["dtos.FirstPartyVulnStatus"];
export type LicenseRiskStatus =
  components["schemas"]["controllers.LicenseRiskStatus"];
export type MakeFinalLicenseDecisionRequest =
  components["schemas"]["dtos.MakeFinalLicenseDecisionRequest"];

export const readDependencyVuln = async (
  scope: AssetVersionScope,
  dependencyVulnID: string,
) =>
  unwrap(
    await browserClient.GET(DEPENDENCY_VULN, {
      params: { path: { ...scope, dependencyVulnID } },
    }),
  );

export const createDependencyVulnEvent = async (
  scope: AssetVersionScope,
  dependencyVulnID: string,
  body: CreateEventRequest,
) =>
  unwrap(
    await browserClient.POST(DEPENDENCY_VULN, {
      params: { path: { ...scope, dependencyVulnID } },
      body,
    }),
  );

// The three mitigate routes do not agree on a field name: dependency vulns and
// license risks read `comment`, first party vulns read `justification`.
export const mitigateDependencyVuln = async (
  scope: AssetVersionScope,
  dependencyVulnID: string,
  comment: string,
) =>
  unwrap(
    await browserClient.POST(`${DEPENDENCY_VULN}/mitigate`, {
      params: { path: { ...scope, dependencyVulnID } },
      body: { comment },
    }),
  );

export const readFirstPartyVuln = async (
  scope: AssetVersionScope,
  firstPartyVulnID: string,
) =>
  unwrap(
    await browserClient.GET(FIRST_PARTY_VULN, {
      params: { path: { ...scope, firstPartyVulnID } },
    }),
  );

export const createFirstPartyVulnEvent = async (
  scope: AssetVersionScope,
  firstPartyVulnID: string,
  body: FirstPartyVulnStatus,
) =>
  unwrap(
    await browserClient.POST(FIRST_PARTY_VULN, {
      params: { path: { ...scope, firstPartyVulnID } },
      body,
    }),
  );

export const mitigateFirstPartyVuln = async (
  scope: AssetVersionScope,
  firstPartyVulnID: string,
  justification: string,
) =>
  unwrap(
    await browserClient.POST(`${FIRST_PARTY_VULN}/mitigate`, {
      params: { path: { ...scope, firstPartyVulnID } },
      body: { justification },
    }),
  );

export const readLicenseRisk = async (
  scope: AssetVersionScope,
  licenseRiskID: string,
) =>
  unwrap(
    await browserClient.GET(LICENSE_RISK, {
      params: { path: { ...scope, licenseRiskID } },
    }),
  );

export const createLicenseRiskEvent = async (
  scope: AssetVersionScope,
  licenseRiskID: string,
  body: LicenseRiskStatus,
) =>
  unwrap(
    await browserClient.POST(LICENSE_RISK, {
      params: { path: { ...scope, licenseRiskID } },
      body,
    }),
  );

export const mitigateLicenseRisk = async (
  scope: AssetVersionScope,
  licenseRiskID: string,
  comment: string,
) =>
  unwrap(
    await browserClient.POST(`${LICENSE_RISK}/mitigate`, {
      params: { path: { ...scope, licenseRiskID } },
      body: { comment },
    }),
  );

export const finalLicenseDecision = async (
  scope: AssetVersionScope,
  licenseRiskID: string,
  body: MakeFinalLicenseDecisionRequest,
) =>
  unwrap(
    await browserClient.POST(`${LICENSE_RISK}/final-license-decision`, {
      params: { path: { ...scope, licenseRiskID } },
      body,
    }),
  );

export type BatchDependencyVulnStatus =
  components["schemas"]["dtos.BatchDependencyVulnStatus"];
export type BatchFirstPartyVulnStatus =
  components["schemas"]["dtos.BatchFirstPartyVulnStatus"];

export const batchUpdateDependencyVulns = async (
  scope: AssetVersionScope,
  body: BatchDependencyVulnStatus,
) =>
  unwrap(
    await browserClient.POST(`${DEPENDENCY_VULNS}/batch`, {
      params: { path: scope },
      body,
    }),
  );

export const batchUpdateFirstPartyVulns = async (
  scope: AssetVersionScope,
  body: BatchFirstPartyVulnStatus,
) =>
  unwrap(
    await browserClient.POST(`${FIRST_PARTY_VULNS}/batch`, {
      params: { path: scope },
      body,
    }),
  );
