// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License

import {
  AssetDTO,
  ComponentRisk,
  OrganizationDetailsDTO,
  ProjectDTO,
  ReleaseRiskHistory,
  RiskHistory,
  VulnEventDTO,
} from "@/types/api/api";
import { Identity } from "@ory/client";
import { externalProviderIdToIntegrationName } from "./externalProvider";
import { config } from "../config";

export const eventMessages = (event: VulnEventDTO) => {
  switch (event.type) {
    case "mitigate":
      return (
        "Everything after this entry will be synced with the external system. The ticket can be found at [" +
        event.arbitraryJSONData.ticketUrl +
        "](" +
        event.arbitraryJSONData.ticketUrl +
        ")"
      );
  }
  return event.justification;
};

export const removeUnderscores = (input: string): string => {
  return input.replace(/_/g, " ");
};

export const emptyThenNull = (input: string | null): string | null => {
  if (input === "") {
    return null;
  }
  return input;
};

export const sortRisk =
  (viewMode: "risk" | "cvss") =>
  (a: ComponentRisk[string], b: ComponentRisk[string]) => {
    if (viewMode === "cvss") {
      if (a.criticalCvss !== b.criticalCvss) {
        return b.criticalCvss - a.criticalCvss;
      }
      if (a.highCvss !== b.highCvss) {
        return b.highCvss - a.highCvss;
      }
      if (a.mediumCvss !== b.mediumCvss) {
        return b.mediumCvss - a.mediumCvss;
      }
      return b.lowCvss - a.lowCvss;
    }

    // critical > high > medium > low
    if (a.critical !== b.critical) {
      return b.critical - a.critical;
    }
    if (a.high !== b.high) {
      return b.high - a.high;
    }
    if (a.medium !== b.medium) {
      return b.medium - a.medium;
    }
    return b.low - a.low;
  };

export const vexOptionMessages: Record<string, string> = {
  component_not_present: "The vulnerable component is not part of the product.",
  vulnerable_code_not_present:
    "The component exists, but the vulnerable code was excluded.",
  vulnerable_code_not_in_execute_path:
    "The vulnerable code exists but is never executed.",
  vulnerable_code_cannot_be_controlled_by_adversary:
    "The attacker cannot control the vulnerable code.",
  inline_mitigations_already_exist:
    "Built-in defenses prevent known exploitation paths.",
};

export const violationLengthToLevel = (length: number) => {
  if (length === 0) return "low";
  if (length <= 2) return "medium";
  if (length <= 4) return "high";
  return "critical";
};

export const eventTypeMessages = (
  event: VulnEventDTO,
  flawName: string,
  events?: VulnEventDTO[],
) => {
  switch (event.type) {
    case "licenseDecision":
      return (
        "made a license decision: " +
        event.arbitraryJSONData.finalLicenseDecision
      );
    case "ticketClosed":
      return "closed the ticket for " + flawName;
    case "ticketDeleted":
      return "deleted the ticket for " + flawName;
    case "mitigate":
      return "created a ticket for " + flawName;
    case "reopened":
      return "reopened " + flawName;
    case "accepted":
      return "accepted the risk of " + flawName;
    case "fixed":
      return "fixed " + flawName;
    case "comment":
      return "added a comment";
    case "detected":
      if (event.arbitraryJSONData.risk === 0) {
        return "detected " + flawName;
      }
      return (
        "detected " +
        flawName +
        " with a risk of " +
        event.arbitraryJSONData.risk +
        " "
      );
    case "falsePositive":
      return "marked " + flawName + " as false positive ";
    case "rawRiskAssessmentUpdated":
      if (events === undefined) {
        return "Updated the risk assessment to " + event.arbitraryJSONData.risk;
      }
      const oldRisk = event.arbitraryJSONData.oldRisk;
      if (!oldRisk && oldRisk !== 0) {
        return "updated the risk assessment to " + event.arbitraryJSONData.risk;
      }
      return (
        "updated the risk assessment from " +
        oldRisk +
        " to " +
        event.arbitraryJSONData.risk
      );
  }
  return "";
};

export const evTypeBackground: { [key in VulnEventDTO["type"]]: string } = {
  accepted: "bg-purple-600",
  fixed: "bg-green-600",
  detected: "bg-red-600",
  falsePositive: "bg-purple-600",
  mitigate: "bg-green-600",
  markedForTransfer: "bg-blue-600",
  rawRiskAssessmentUpdated: "bg-secondary",
  reopened: "bg-red-600",
  comment: "bg-secondary",
  ticketClosed: "bg-red-600",
  ticketDeleted: "bg-red-600",
  licenseDecision: "bg-yellow-500 !text-black",
};

export const osiLicenseHexColors: Record<string, string> = {
  MIT: "#fbbd25",
  "Apache-2.0": "#fdc758",
  "GPL-3.0": "#fed180",
  "GPL-2.0": "#fddba6",
  "BSD-2-Clause": "#f8e6cb",
  "BSD-3-Clause": "#f1f1f1",
  "LGPL-3.0": "#d5d2f4",
  "AGPL-3.0": "#b7b5f7",
  "EPL-2.0": "#9698f9",
  "MPL-2.0": "#6d7dfa",
  unknown: "#2563fb",
  "CC0-1.0": "#ffffff",
};

export const getParentRepositoryIdAndName = (
  project?: ProjectDTO,
): {
  parentRepositoryId: string | undefined;
  parentRepositoryName: string | undefined;
} => {
  if (!project) {
    return {
      parentRepositoryId: undefined,
      parentRepositoryName: undefined,
    };
  }

  if (project.repositoryId && project.repositoryName) {
    return {
      parentRepositoryId: project.repositoryId,
      parentRepositoryName: project.repositoryName,
    };
  } else if (project.parent) {
    return getParentRepositoryIdAndName(project.parent);
  }
  return {
    parentRepositoryId: undefined,
    parentRepositoryName: undefined,
  };
};

export const getIntegrationNameFromRepositoryIdOrExternalProviderId = (
  asset?: AssetDTO,
  project?: ProjectDTO,
): "gitlab" | "github" | "jira" | undefined => {
  if (asset && asset.repositoryId) {
    const repoID = asset.repositoryId;

    if (repoID?.startsWith("gitlab:")) {
      return "gitlab";
    } else if (repoID?.startsWith("github:")) {
      return "github";
    } else if (repoID?.startsWith("jira:")) {
      return "jira";
    }
  }
  if (asset?.externalEntityProviderId) {
    return externalProviderIdToIntegrationName(asset.externalEntityProviderId);
  }

  const parentRepoID = getParentRepositoryIdAndName(project).parentRepositoryId;

  if (parentRepoID?.startsWith("gitlab:")) {
    return "gitlab";
  } else if (parentRepoID?.startsWith("github:")) {
    return "github";
  } else if (parentRepoID?.startsWith("jira:")) {
    return "jira";
  }
  return undefined;
};

export const defaultScanner =
  "github.com/l3montree-dev/devguard/cmd/devguard-scanner/";
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const findUser = (
  id: string,
  org: OrganizationDetailsDTO,
  currentUser?: Identity,
) => {
  if (id === "system") {
    return {
      displayName: "System",
      realName: "System",
    };
  }
  if (currentUser?.id === id) {
    return {
      displayName: "You",
      avatarUrl: currentUser.traits?.picture,
      realName:
        currentUser.traits?.name.first + " " + currentUser.traits?.name.last,
    };
  }
  const user = org?.members.find((u) => u.id === id);

  if (!user) {
    return {
      displayName: "Unknown",
      realName: "Unknown",
    };
  }
  if (id.startsWith("github:")) {
    // the id is assembled like:
    // github:<username>:<base64-avatar>

    return {
      displayName: user.name + " (GitHub)",
      realName: user.name + " (GitHub)",
      avatarUrl: user.avatarUrl,
    };
  }

  return {
    displayName: user?.name,
    realName: user?.name,
    avatarUrl: user?.avatarUrl,
  };
};

// A simple hash function to convert the project ID to a consistent integer
export const hashCode = (str: string) => {
  return Array.from(str).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
};

const colors = [
  "#fbbd25",
  "#ffca5b",
  "#ffd785",
  "#ffe4ae",
  "#fff1d6",
  "#ffffff",
  "#dfddfc",
  "#bcbdf9",
  "#979ef5",
  "#6c7ff0",
  "#2563eb",
];

// Generate HSL color
export const generateColor = (str: string) => {
  const hash = Math.abs(hashCode(str));

  return colors[hash % colors.length];
};

export const reduceRiskHistories = (
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

export const generateNewSecret = (): string => {
  return crypto.randomUUID();
};

export interface ContentTreeElement extends ProjectDTO {
  assets: Array<AssetDTO>;
}

export const normalizeContentTree = (
  contentTree: Array<ContentTreeElement>,
) => {
  const assetMap: {
    [key: string]:
      | (AssetDTO & {
          project: ProjectDTO;
        })
      | undefined;
  } = {};

  contentTree.forEach((element) => {
    element.assets.forEach((asset) => {
      assetMap[asset.id] = {
        ...asset,
        project: {
          ...element,
          // @ts-expect-error
          assets: undefined, // remove assets to avoid circular reference
        },
      };
    });
  });

  return assetMap;
};

export interface ThemeConfig {
  config: typeof config;
}

export class RedirectorBuilder {
  private organizationSlug?: string;
  private projectSlug?: string;
  private assetSlug?: string;
  private assetId?: string;
  private assetVersionName?: string;
  private contentTreeElement?: ContentTreeElement[];

  setOrganizationSlug(organizationSlug: string): RedirectorBuilder {
    this.organizationSlug = organizationSlug;
    return this;
  }

  setProjectSlug(projectSlug: string): RedirectorBuilder {
    this.projectSlug = projectSlug;
    return this;
  }

  setAssetSlug(assetSlug: string): RedirectorBuilder {
    this.assetSlug = assetSlug;
    return this;
  }

  setAssetId(assetId: string): RedirectorBuilder {
    this.assetId = assetId;
    return this;
  }

  setAssetVersionName(assetVersionName: string): RedirectorBuilder {
    this.assetVersionName = assetVersionName;
    return this;
  }

  setContentTree(contentTreeElement: ContentTreeElement[]): RedirectorBuilder {
    this.contentTreeElement = contentTreeElement;
    return this;
  }

  build(): string {
    if (this.assetId !== undefined) {
      if (this.contentTreeElement === undefined) {
        throw new Error("ContentTreeElement must be set when using assetId");
      } else {
        const asset = this.contentTreeElement
          .map((ct) => ct.assets.find((a) => a.id === this.assetId!))
          .filter((a) => !!a)[0];
        if (asset === undefined) {
          throw new Error(
            `Asset with id ${this.assetId} not found in content tree element - maybe missing permission`,
          );
        }
        this.assetSlug = asset.slug;
      }
    }

    if (this.organizationSlug === undefined) {
      throw new Error("OrganizationSlug is required");
    }

    let url = `/${this.organizationSlug}/`;

    if (this.projectSlug !== undefined) {
      url += `projects/${this.projectSlug}/`;

      if (this.assetSlug !== undefined) {
        url += `assets/${this.assetSlug}`;

        if (this.assetVersionName !== undefined) {
          url += `/refs/${this.assetVersionName}`;
        }
      }
    }
    return url;
  }
}
