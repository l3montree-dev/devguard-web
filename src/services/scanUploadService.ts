// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { apiFetch, browserClient, unwrap } from "@/services/apiClient";

export interface ScanTarget {
  assetName: string;
  branchOrTagName: string;
  isTag: boolean;
  isDefault: boolean;
  artifactName: string;
  origin: string;
}

export interface AssetScope {
  organization: string;
  projectSlug: string;
  assetSlug: string;
}

// Multipart, so not the generated client: openapi-fetch would serialize the
// FormData and drop the boundary.
export const uploadSbomFile = (
  scope: AssetScope,
  target: ScanTarget,
  file: File,
) => {
  const body = new FormData();
  body.append("file", file);

  return apiFetch(
    `/organizations/${scope.organization}/projects/${scope.projectSlug}/assets/${scope.assetSlug}/sbom-file`,
    {
      method: "POST",
      body,
      headers: {
        "X-Asset-Name": target.assetName,
        "X-Asset-Ref": target.branchOrTagName,
        "X-Asset-Default-Branch": target.isDefault
          ? target.branchOrTagName
          : "",
        "X-Tag": target.isTag ? "1" : "0",
        "X-Artifact-Name": target.artifactName,
        "X-Origin": target.origin,
      },
    },
  );
};

const raw = {
  bodySerializer: (body: Record<string, never>) => body as unknown as string,
};

export const uploadSarif = async (target: ScanTarget, sarif: string) =>
  unwrap(
    await browserClient.POST("/sarif-scan", {
      ...raw,
      params: {
        header: {
          "X-Asset-Name": target.assetName,
          "X-Asset-Ref": target.branchOrTagName,
          "X-Asset-Default-Branch": target.isDefault
            ? target.branchOrTagName
            : "",
          "X-Tag": target.isTag ? "1" : "0",
          "X-Scanner": target.origin,
        },
      },
      body: sarif as never,
    }),
  );

export const uploadVex = async (
  target: Pick<ScanTarget, "assetName" | "origin">,
  vex: string,
) =>
  unwrap(
    await browserClient.POST("/vex", {
      ...raw,
      params: {
        header: {
          "X-Asset-Name": target.assetName,
          "X-Origin": target.origin,
        },
      },
      body: vex as never,
    }),
  );
