// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type { PostureScope } from "@/services/compliancePostureService";
import { readPosture } from "@/services/compliancePostureService";
import type { ComplianceComponentDetailsDTO } from "@/types/dto";
import type { DetailedComplianceRiskDTO } from "@/types/view/vulnEvents";

export const useCompliancePosture = (
  scope: PostureScope,
  frameworkControlID: string | undefined,
) =>
  useSWR(
    frameworkControlID
      ? (["posture", scope, frameworkControlID] as const)
      : null,
    async ([, postureScope, control]) =>
      (await readPosture(
        postureScope,
        control,
      )) as unknown as DetailedComplianceRiskDTO,
  );

// Not on the generated client: the route takes dynamic filterQuery[field][op]
// keys, which OpenAPI cannot express.
export const useComplianceComponentsForControl = (
  frameworkControlID: string | undefined,
) =>
  useSWR<ComplianceComponentDetailsDTO[]>(
    frameworkControlID
      ? `/compliance-components/?filterQuery[frameworkControlId][is]=${encodeURIComponent(frameworkControlID)}`
      : null,
    fetcher,
  );
