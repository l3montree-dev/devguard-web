"use client";

import { groupBy } from "lodash";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "../../../../../hooks/useApi";
import {
  AverageFixingTime,
  Paged,
  ReleaseDTO,
  ReleaseRiskHistory,
  RiskHistory,
} from "../../../../../types/api/api";
import OverviewPage from "./OverviewPage";

const Page = () => {
  const search = useSearchParams();
  const params = useParams() as {
    organizationSlug: string;
    projectSlug: string;
  };
  let { organizationSlug, projectSlug } = params;
  const artifact = search?.get("artifact");

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const last3Month = new Date();
  last3Month.setMonth(last3Month.getMonth() - 3);

  const { data: releases } = useSWR<Paged<ReleaseDTO>>(
    `/organizations/${organizationSlug}/projects/${projectSlug}/releases/`,
  );

  let releaseId: string | undefined = undefined;

  if (releases) {
    const artifactIndex = releases.data.findIndex((r) => r.name === artifact);
    if (!artifact || artifactIndex === -1) {
      releaseId = releases.data.length > 0 ? releases.data[0].id : undefined;
    } else {
      releaseId = releases.data[artifactIndex].id;
    }
  }

  // fetch all the data
  const { data: riskHistory } = useSWR(
    () =>
      releaseId
        ? "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/releases/" +
          releaseId +
          "/stats"
        : null,
    fetcher,
    { suspense: true },
  );

  const { data: avgLowFixingTime } = useSWR<AverageFixingTime>(
    () =>
      releaseId
        ? "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/releases/" +
          releaseId +
          "/average-fixing-time?severity=low"
        : null,
    fetcher,
    { suspense: true },
  );

  const { data: avgMediumFixingTime, isLoading: avgMediumFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      () =>
        releaseId
          ? "/organizations/" +
            organizationSlug +
            "/projects/" +
            projectSlug +
            "/releases/" +
            releaseId +
            "/average-fixing-time?severity=medium"
          : null,
      fetcher,
      { suspense: true },
    );

  const { data: avgHighFixingTime, isLoading: avgHighFixingTimeLoading } =
    useSWR<AverageFixingTime>(
      () =>
        releaseId
          ? "/organizations/" +
            organizationSlug +
            "/projects/" +
            projectSlug +
            "/releases/" +
            releaseId +
            "/average-fixing-time?severity=high"
          : null,
      fetcher,
      { suspense: true },
    );
  const { data: avgCriticalFixingTime } = useSWR<AverageFixingTime>(
    () =>
      releaseId
        ? "/organizations/" +
          organizationSlug +
          "/projects/" +
          projectSlug +
          "/releases/" +
          releaseId +
          "/average-fixing-time?severity=critical"
        : null,
    fetcher,
    { suspense: true },
  );

  const groups = groupBy(riskHistory, "day");
  const days = Object.keys(groups).sort();
  const completeRiskHistory: RiskHistory[][] = days.map((day) => {
    return groups[day];
  });

  return (
    <OverviewPage
      releases={releases ?? { data: [], total: 0, page: 1, pageSize: 25 }}
      riskHistory={completeRiskHistory}
      avgLowFixingTime={
        avgLowFixingTime ?? {
          averageFixingTimeSeconds: 0,
          averageFixingTimeSecondsByCvss: 0,
        }
      }
      avgMediumFixingTime={
        avgMediumFixingTime ?? {
          averageFixingTimeSeconds: 0,
          averageFixingTimeSecondsByCvss: 0,
        }
      }
      avgHighFixingTime={
        avgHighFixingTime ?? {
          averageFixingTimeSeconds: 0,
          averageFixingTimeSecondsByCvss: 0,
        }
      }
      avgCriticalFixingTime={
        avgCriticalFixingTime ?? {
          averageFixingTimeSeconds: 0,
          averageFixingTimeSecondsByCvss: 0,
        }
      }
      reducedRiskHistory={reduceRiskHistories(completeRiskHistory)}
    />
  );
};

const reduceRiskHistories = (
  histories: RiskHistory[][],
): Array<ReleaseRiskHistory> => {
  return histories.map((dayHistories) => {
    return dayHistories.reduce(
      (acc, curr) => {
        acc.low += curr.low;
        acc.medium += curr.medium;
        acc.high += curr.high;
        acc.critical += curr.critical;
        acc.lowCvss += curr.lowCvss;
        acc.mediumCvss += curr.mediumCvss;
        acc.highCvss += curr.highCvss;
        acc.criticalCvss += curr.criticalCvss;
        return acc;
      },
      {
        id: dayHistories[0]?.id || "",
        day: dayHistories[0]?.day || new Date(),
        assetId: dayHistories[0]?.assetId || "",
        artifactName: dayHistories[0]?.artifactName || "",
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
        lowCvss: 0,
        mediumCvss: 0,
        highCvss: 0,
        criticalCvss: 0,
      } as RiskHistory,
    );
  });
};

export default Page;
