// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { fetcher } from "@/data-fetcher/fetcher";
import { useActiveOrg } from "@/hooks/useActiveOrg";
import type {
  AssetDTO,
  Paged,
  ProjectDTO,
  VulnByPackage,
} from "@/types/api/api";
import type {
  HelpCenter,
  TourSearch,
  TourTargets,
} from "@/types/view/helpcenter";
import { useEffect, useState } from "react";
import useSWR from "swr";

const useTourTargets = (
  orgSlug: string,
  projectSlug: string | undefined,
  ready: boolean,
  stubs: AssetDTO[],
) => {
  const [search, setSearch] = useState<TourSearch>();

  useEffect(() => {
    if (!projectSlug || !ready) return;

    let cancelled = false;

    const find = async () => {
      const targets: TourTargets = {};
      const publish = () => setSearch({ projectSlug, targets: { ...targets } });

      for (const stub of stubs) {
        const asset = await fetcher<AssetDTO>(
          `/organizations/${orgSlug}/projects/${projectSlug}/assets/${stub.slug}`,
        ).catch(() => null);
        if (cancelled) return;

        const ref = asset?.refs?.[0];
        if (!ref) continue;

        if (targets.repo === undefined) {
          targets.repo = { projectSlug, assetSlug: stub.slug };
          publish();
        }

        const vulns = await fetcher<Paged<VulnByPackage>>(
          `/organizations/${orgSlug}/projects/${projectSlug}/assets/${stub.slug}/refs/${ref.slug}/dependency-vulns/?pageSize=1`,
        ).catch(() => null);
        if (cancelled) return;

        const vulnId = vulns?.data?.[0]?.vulns?.[0]?.id;
        if (!vulnId) continue;

        targets.depRisk = {
          projectSlug,
          assetSlug: stub.slug,
          refSlug: ref.slug,
          vulnId,
        };
        publish();
        return;
      }

      targets.repo ??= null;
      targets.depRisk ??= null;
      publish();
    };

    find();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug, projectSlug, ready]);

  return search;
};

export const useHelpCenter = (): HelpCenter => {
  const activeOrg = useActiveOrg();

  const { data: projects, isLoading: isProjectsLoading } = useSWR<
    Paged<ProjectDTO>
  >(`/organizations/${activeOrg.slug}/projects/`, fetcher);
  const firstProject = projects?.data?.[0];

  const { data: resources } = useSWR<Paged<AssetDTO | ProjectDTO>>(
    firstProject
      ? `/organizations/${activeOrg.slug}/projects/${firstProject.slug}/resources?parentId=${firstProject.id}&filterQuery[state][is]=active`
      : null,
    fetcher,
  );
  const allAssetStubs = (resources?.data ?? []).filter(
    (r): r is AssetDTO => !("type" in r),
  );

  const search = useTourTargets(
    activeOrg.slug,
    firstProject?.slug,
    Boolean(resources),
    allAssetStubs,
  );

  const hasNoProject = Boolean(projects) && !firstProject;
  const targets =
    search?.projectSlug === firstProject?.slug ? search?.targets : undefined;

  const repoTourTarget = hasNoProject ? null : targets?.repo;
  const depRiskTarget = hasNoProject ? null : targets?.depRisk;

  return {
    isLoading:
      isProjectsLoading ||
      depRiskTarget === undefined ||
      repoTourTarget === undefined,
    welcomeTour: {
      href: `/${activeOrg.slug}?startTour=org-home`,
    },
    groupTour: {
      href: firstProject
        ? `/${activeOrg.slug}/projects/${firstProject.slug}?startTour=group-home`
        : undefined,
      disabledReason: firstProject ? undefined : "No group found",
    },
    repoTour: {
      href: repoTourTarget
        ? `/${activeOrg.slug}/projects/${repoTourTarget.projectSlug}/assets/${repoTourTarget.assetSlug}?startTour=repo-home`
        : undefined,
      disabledReason:
        repoTourTarget === null
          ? !firstProject
            ? "No group found"
            : !allAssetStubs.length
              ? "No repository found"
              : "Risk scanning not set up yet"
          : undefined,
    },
    depRiskTour: {
      href: depRiskTarget
        ? `/${activeOrg.slug}/projects/${depRiskTarget.projectSlug}/assets/${depRiskTarget.assetSlug}/refs/${depRiskTarget.refSlug}/dependency-risks/${depRiskTarget.vulnId}?startTour=dependency-risk`
        : undefined,
      disabledReason:
        depRiskTarget !== undefined
          ? depRiskTarget === null
            ? "No vulnerabilities found"
            : undefined
          : !firstProject
            ? "No group found"
            : !allAssetStubs.length
              ? "No repository found"
              : undefined,
    },
  };
};
