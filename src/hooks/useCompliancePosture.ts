// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { useMemo } from "react";
import useSWR from "swr";

import { fetcher } from "@/data-fetcher/fetcher";
import type {
  ComplianceScope,
  PostureScope,
} from "@/services/compliancePostureService";
import {
  complianceScopeBaseUrl,
  readPosture,
} from "@/services/compliancePostureService";
import type { ComplianceComponentDetailsDTO } from "@/types/dto";
import type { DetailedComplianceRiskDTO } from "@/types/view/vulnEvents";

export const useCompliancePosture = (
  scope: PostureScope,
  controlHash: string | undefined,
) =>
  useSWR(
    controlHash ? (["posture", scope, controlHash] as const) : null,
    async ([, postureScope, control]) =>
      (await readPosture(
        postureScope,
        control,
      )) as unknown as DetailedComplianceRiskDTO,
  );

// The compliance components of the scope which implement the control in one of its frameworks.
export const useComplianceComponentsForControl = (
  scope: ComplianceScope,
  frameworkControlIds: string[] | undefined,
) => {
  const { data } = useSWR<ComplianceComponentDetailsDTO[]>(
    frameworkControlIds
      ? `${complianceScopeBaseUrl(scope)}compliance-components/`
      : null,
    fetcher,
  );
  const components = useMemo(
    () =>
      data?.filter((c) =>
        (c.implementedControls ?? []).some((ic) =>
          frameworkControlIds?.includes(ic.frameworkControlId),
        ),
      ),
    [data, frameworkControlIds],
  );
  return { data: components };
};
