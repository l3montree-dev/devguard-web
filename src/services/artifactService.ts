// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { AssetVersionScope } from "@/hooks/useAssetVersionStats";
import { browserClient, unwrap } from "@/services/apiClient";
import type { components } from "@/types/api/generated";

type GeneratedArtifactRequest =
  components["schemas"]["controllers.ArtifactRequest"];

type GeneratedInformationSource =
  GeneratedArtifactRequest["informationSources"][number];

// purl is a pointer and type carries omitempty in Go, so both are optional
// despite the spec declaring them required.
export type InformationSource = Pick<GeneratedInformationSource, "url"> &
  Partial<GeneratedInformationSource>;

export type ArtifactRequest = Omit<
  GeneratedArtifactRequest,
  "informationSources"
> & { informationSources: InformationSource[] };

const asBody = (body: ArtifactRequest) => body as GeneratedArtifactRequest;

export const createArtifact = async (
  scope: AssetVersionScope,
  body: ArtifactRequest,
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/",
      { params: { path: scope }, body: asBody(body) },
    ),
  );

export const updateArtifact = async (
  scope: AssetVersionScope,
  body: ArtifactRequest,
) =>
  unwrap(
    await browserClient.PUT(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/{artifactName}/",
      {
        params: { path: { ...scope, artifactName: body.artifactName } },
        body: asBody(body),
      },
    ),
  );

export const deleteArtifact = async (
  scope: AssetVersionScope,
  artifactName: string,
) =>
  unwrap(
    await browserClient.DELETE(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/{artifactName}/",
      { params: { path: { ...scope, artifactName } } },
    ),
  );

export const syncArtifactExternalSources = async (
  scope: AssetVersionScope,
  artifactName: string,
) =>
  unwrap(
    await browserClient.POST(
      "/organizations/{organization}/projects/{projectSlug}/assets/{assetSlug}/refs/{assetVersionSlug}/artifacts/{artifactName}/sync-external-sources",
      { params: { path: { ...scope, artifactName } } },
    ),
  );
