// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

export type RepoTourTarget = {
  projectSlug: string;
  assetSlug: string;
};

export type DepRiskTarget = {
  projectSlug: string;
  assetSlug: string;
  refSlug: string;
  vulnId: string;
};

// undefined = still searching, null = nothing found
export type TourTargets = {
  repo?: RepoTourTarget | null;
  depRisk?: DepRiskTarget | null;
};

export type TourSearch = {
  projectSlug: string;
  targets: TourTargets;
};

export type TourAvailability = {
  href?: string;
  disabledReason?: string;
};

export type HelpCenter = {
  isLoading: boolean;
  welcomeTour: TourAvailability;
  groupTour: TourAvailability;
  repoTour: TourAvailability;
  depRiskTour: TourAvailability;
};
