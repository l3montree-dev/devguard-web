// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";

type S = components["schemas"];

// The distribution diagram is fed by org, project and asset version risk
// history, which are separate DTOs; it plots only the fields they share.
export type RiskHistoryPoint = Pick<
  S["dtos.OrgRiskHistory"],
  | "day"
  | "cvePurlLow"
  | "cvePurlMedium"
  | "cvePurlHigh"
  | "cvePurlCritical"
  | "cvePurlLowCvss"
  | "cvePurlMediumCvss"
  | "cvePurlHighCvss"
  | "cvePurlCriticalCvss"
  | "cvePurlFixableLow"
  | "cvePurlFixableMedium"
  | "cvePurlFixableHigh"
  | "cvePurlFixableCritical"
  | "cvePurlFixableLowCvss"
  | "cvePurlFixableMediumCvss"
  | "cvePurlFixableHighCvss"
  | "cvePurlFixableCriticalCvss"
>;

// The three top-* lists address their target differently: projects carry a
// slug, assets a projectSlug plus slug, artifacts the asset version they
// belong to.
export type VulnDistributionInStructure = Omit<
  S["dtos.ProjectVulnDistribution"],
  "name" | "slug"
> & {
  name: string;
  slug?: string;
  projectSlug?: string;
  assetSlug?: string;
  assetVersionName?: string;
};
