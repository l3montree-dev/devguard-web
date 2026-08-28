// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  readDependencyVuln,
  readFirstPartyVuln,
  readLicenseRisk,
} from "@/services/vulnService";
import type {
  DetailedDependencyVulnDTO,
  DetailedFirstPartyVulnDTO,
  DetailedLicenseRiskDTO,
} from "@/types/view/vulnEvents";

// The generated event type is flat; the frontend models events as a
// discriminated union so arbitraryJSONData is typed per event kind.
export const useDependencyVuln = (
  scope: AssetVersionScope,
  dependencyVulnID: string,
) =>
  useSWR(
    ["dependency-vuln", scope, dependencyVulnID] as const,
    async ([, vulnScope, id]) =>
      (await readDependencyVuln(
        vulnScope,
        id,
      )) as unknown as DetailedDependencyVulnDTO,
  );

export const useFirstPartyVuln = (
  scope: AssetVersionScope,
  firstPartyVulnID: string,
) =>
  useSWR(
    ["first-party-vuln", scope, firstPartyVulnID] as const,
    async ([, vulnScope, id]) =>
      (await readFirstPartyVuln(
        vulnScope,
        id,
      )) as unknown as DetailedFirstPartyVulnDTO,
  );

export const useLicenseRisk = (
  scope: AssetVersionScope,
  licenseRiskID: string,
) =>
  useSWR(
    ["license-risk", scope, licenseRiskID] as const,
    async ([, vulnScope, id]) =>
      (await readLicenseRisk(
        vulnScope,
        id,
      )) as unknown as DetailedLicenseRiskDTO,
  );

export const usePathToComponent = (
  scope: AssetVersionScope,
  componentPurl: string | undefined,
) =>
  useApiQuery(
    componentPurl
      ? "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/path-to-component/"
      : null,
    { params: { path: scope, query: { purl: componentPurl } } },
  );
