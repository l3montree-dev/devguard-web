// Copyright 2024 Tim Bastin, l3montree GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and

import {
  AssetDTO,
  AssetVersionDTO,
  ProjectDTO,
  RiskHistory,
} from "@/types/api/api";

type RiskHistoryEl = {
  riskHistory: RiskHistory[];
} & (
  | {
      project?: ProjectDTO;
      asset: AssetDTO;
    }
  | {
      project: ProjectDTO;
      asset?: AssetDTO;
    }
);

// limitations under the License.
export function padRiskHistory<T extends RiskHistoryEl>(
  riskHistory: Array<T>,
): Array<T> {
  const lengths = riskHistory.map((r) => r.riskHistory.length);
  const max = Math.max(...lengths);

  // check if some array needs to be padded
  riskHistory.forEach((r) => {
    if (r.riskHistory.length === max) {
      return r;
    }
    if (r.riskHistory.length === 0) {
      return r;
    }
    // it is smaller - thus we need to prepend fake elements
    let firstDay = new Date(r.riskHistory[0].day);
    while (r.riskHistory.length < max) {
      // decrement firstDay by 1 day
      const clone = new Date(firstDay);
      // decrement by 1 day
      clone.setDate(clone.getDate() - 1);

      r.riskHistory = [
        {
          id: "pad-" + clone.getTime(),
          day: clone.toUTCString(),
          assetId: "",
          artifactName: "",
          assetVersionName: "",
          sumClosedRisk: 0,
          sumOpenRisk: 0,
          maxClosedRisk: 0,
          maxOpenRisk: 0,
          averageClosedRisk: 0,
          averageOpenRisk: 0,
          openVulns: 0,
          fixedVulns: 0,
          minClosedRisk: 0,
          minOpenRisk: 0,

          low: 0,
          medium: 0,
          high: 0,
          critical: 0,

          lowCvss: 0,
          mediumCvss: 0,
          highCvss: 0,
          criticalCvss: 0,
        },
        ...r.riskHistory,
      ];

      firstDay = clone;
    }
  });

  riskHistory.sort(
    (a, b) =>
      (b.riskHistory[b.riskHistory.length - 1]?.sumOpenRisk ?? 0) -
      (a.riskHistory[a.riskHistory.length - 1]?.sumOpenRisk ?? 0),
  );

  return riskHistory;
}

export const maybeGetRedirectDestination = (
  asset: AssetDTO,
  organizationSlug: string,
  projectSlug: string,
  assetVersionSlug: string,
) => {
  const branches: string[] = [];
  const tags: string[] = [];

  if (asset.refs.length !== 0) {
    asset.refs.map((av: AssetVersionDTO) => {
      if (av.type === "branch") {
        branches.push(av.slug);
      } else if (av.type === "tag") {
        tags.push(av.slug);
      } else {
        throw new Error("Unknown asset version type " + av.type);
      }
    });
    const assetVersionSlugString = assetVersionSlug as string;
    if (
      branches.includes(assetVersionSlugString) ||
      tags.includes(assetVersionSlugString)
    ) {
    } else {
      if (branches.includes("main")) {
        assetVersionSlug = "main";
        return {
          redirect: {
            destination: `/${organizationSlug}/projects/${projectSlug}/assets/${asset.slug}/refs/main/dependency-risks`,
            permanent: false,
          },
        };
      } else if (branches.length > 0) {
        assetVersionSlug = branches[0];
        return {
          redirect: {
            destination: `/${organizationSlug}/projects/${projectSlug}/assets/${asset.slug}/refs/${branches[0]}/dependency-risks`,
            permanent: false,
          },
        };
      } else if (tags.length > 0) {
        assetVersionSlug = tags[0];
        return {
          redirect: {
            destination: `/${organizationSlug}/projects/${projectSlug}/assets/${asset.slug}/refs/${tags[0]}/dependency-risks`,
            permanent: false,
          },
        };
      }
    }
  }
};

export const filterEventTypesFromOtherBranches = [
  "detected",
  "rawRiskAssessmentUpdated",
  "addedScanner",
  "removedScanner",
];

export const extractResponse = async <T>(
  response: Response,
  defaultValue: T,
): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>;
  } else {
    return defaultValue;
  }
};
