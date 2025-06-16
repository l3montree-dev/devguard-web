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
  OrganizationDetailsDTO,
  ProjectDTO,
  VulnEventDTO,
} from "@/types/api/api";
import { Identity } from "@ory/client";
import { externalProviderIdToIntegrationName } from "./externalProvider";

export const eventMessages = (event: VulnEventDTO) => {
  switch (event.type) {
    case "mitigate":
      return (
        "Everything after this entry will be synced with the external system. The ticket can be found at [" +
        event.arbitraryJsonData.ticketUrl +
        "](" +
        event.arbitraryJsonData.ticketUrl +
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
    case "detectedOnAnotherBranch":
      return (
        "detected " + flawName + " on another ref: " + event.assetVersionName
      );
    case "addedScanner":
      return (
        "detected " +
        flawName +
        " with scanner: " +
        event.arbitraryJsonData.scannerIds.replace(defaultScanner, "")
      );

    case "removedScanner":
      return (
        "removed scanner: " +
        event.arbitraryJsonData.scannerIds.replace(defaultScanner, "")
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
      if (event.arbitraryJsonData.risk === 0) {
        return "detected " + flawName;
      }
      return (
        "detected " +
        flawName +
        " with a risk of " +
        event.arbitraryJsonData.risk +
        " "
      );
    case "falsePositive":
      return "marked " + flawName + " as false positive ";
    case "rawRiskAssessmentUpdated":
      if (events === undefined) {
        return "Updated the risk assessment to " + event.arbitraryJsonData.risk;
      }
      const oldRisk = event.arbitraryJsonData.oldRisk;
      if (!oldRisk && oldRisk !== 0) {
        return "updated the risk assessment to " + event.arbitraryJsonData.risk;
      }
      return (
        "updated the risk assessment from " +
        oldRisk +
        " to " +
        event.arbitraryJsonData.risk
      );
  }
  return "";
};

export const evTypeBackground: { [key in VulnEventDTO["type"]]: string } = {
  accepted: "bg-purple-600 text-white",
  fixed: "bg-green-600 text-white",
  detected: "bg-red-600 text-white",
  falsePositive: "bg-purple-600 text-white",
  mitigate: "bg-green-600 text-black",
  markedForTransfer: "bg-blue-600 text-white",
  rawRiskAssessmentUpdated: "bg-secondary",
  reopened: "bg-red-600 text-white",
  comment: "bg-secondary",
  ticketClosed: "bg-red-600 text-white",
  ticketDeleted: "bg-red-600 text-white",
  addedScanner: "bg-secondary",
  removedScanner: "bg-secondary",
  detectedOnAnotherBranch: "bg-secondary",
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
): "gitlab" | "github" | undefined => {
  if (asset && asset.repositoryId) {
    return asset.repositoryId.startsWith("gitlab:") ? "gitlab" : "github";
  }
  if (asset?.externalEntityProviderId) {
    return externalProviderIdToIntegrationName(asset.externalEntityProviderId);
  }
  return getParentRepositoryIdAndName(project).parentRepositoryId?.startsWith(
    "gitlab:",
  )
    ? "gitlab"
    : "github";
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
