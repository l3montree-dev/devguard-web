// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { components } from "@/types/api/generated";

type S = components["schemas"];

// An OpenSSF scorecard, stored as JSONB on the component project, so the spec
// can only describe it as a bare object. This is the shape the UI renders.
export interface Documentation {
  shortDescription: string;
  url: string;
}

export interface Check {
  details: string[];
  documentation: Documentation;
  name: string;
  reason: string;
  score: number;
}

export interface Repository {
  commit: string;
  name: string;
}

export interface Scorecard {
  commit: string;
  version: string;
}

export interface ScoreCard {
  checks: Check[];
  date: string;
  metadata: unknown[];
  overallScore: number;
  repository: Repository;
  scorecard: Scorecard;
}

export type ComponentProject = Omit<
  S["dtos.ComponentProjectDTO"],
  "scoreCard"
> & {
  scoreCard: ScoreCard;
};

export type Component = Omit<S["dtos.ComponentDTO"], "project"> & {
  project?: ComponentProject;
};

export type ComponentPaged = Omit<
  S["dtos.ComponentDependencyDTO"],
  "component" | "dependency"
> & {
  component: Component;
  dependency: Component;
};

// dependencyPurl, componentPurl, componentVersion, artifactName and
// artifactAssetVersion are pointers in Go, so they may be absent.
export type ProjectDependency = Omit<
  S["dtos.ComponentOccurrenceDTO"],
  | "dependencyPurl"
  | "componentPurl"
  | "componentVersion"
  | "artifactName"
  | "artifactAssetVersion"
> & {
  dependencyPurl: string | null;
  componentPurl: string | null;
  componentVersion: string | null;
  artifactName?: string | null;
  artifactAssetVersion?: string | null;
};

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
