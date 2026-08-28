// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { ComponentRisk } from "@/types/view/component";
import type { RiskHistoryPoint } from "@/types/view/riskHistory";

import type { AssetDTO, OrganizationDetailsDTO, ProjectDTO } from "@/types/dto";

import type { VulnEventDTO } from "@/types/view/vulnEvents";
import { type Identity } from "@ory/client-fetch";
import { externalProviderIdToIntegrationName } from "./externalProvider";
import type { User } from "@/types/auth";
import { getUserFullName } from "@/utils/auth";
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
  let message = "";
  switch (event.type) {
    case "licenseDecision":
      message =
        "made a license decision: " +
          event.arbitraryJSONData.finalLicenseDecision ||
        event.arbitraryJSONData.license ||
        "unknown license";
      break;
    case "mitigate":
      message = "created a ticket for " + flawName;
      break;
    case "reopened":
      message = "reopened " + flawName;
      break;
    case "accepted":
      message = "accepted the risk of " + flawName;
      break;
    case "fixed":
      message = "fixed " + flawName;
      break;
    case "comment":
      message = "added a comment";
      break;
    case "detected":
      if (event.arbitraryJSONData.risk === 0) {
        message = "detected " + flawName;
      } else {
        message =
          "detected " +
          flawName +
          " with a risk of " +
          event.arbitraryJSONData.risk;
      }
      break;
    case "falsePositive":
      message = "marked " + flawName + " as false positive";
      break;
    case "implemented":
      message = "marked " + flawName + " as implemented";
      break;
    case "notApplicable":
      message = "marked " + flawName + " as not applicable";
      break;
    case "attachedComplianceComponent":
      message =
        "attached " +
        event.arbitraryJSONData.componentTitle +
        " to " +
        flawName;
      break;
    case "removedComplianceComponent":
      message =
        "removed " +
        event.arbitraryJSONData.componentTitle +
        " from " +
        flawName;
      break;
    case "rawRiskAssessmentUpdated": {
      const oldRisk = event.arbitraryJSONData.oldRisk;
      if (events === undefined || (!oldRisk && oldRisk !== 0)) {
        message =
          "updated the risk assessment to " + event.arbitraryJSONData.risk;
      } else {
        message =
          "updated the risk assessment from " +
          oldRisk +
          " to " +
          event.arbitraryJSONData.risk;
      }
      break;
    }
    case "published": {
      message = "published " + flawName;
      break;
    }
    case "withdrawn": {
      message = "withdrew " + flawName;
      break;
    }
    case "created": {
      message = "created " + flawName;
      break;
    }
  }
  if (event.userAgent === "devguard-mcp-server") {
    message += " (applied by AI agent)";
  }
  return message;
};

export const evTypeBackground: { [key in VulnEventDTO["type"]]: string } = {
  accepted: "bg-info text-info-foreground!",
  fixed: "bg-success text-success-foreground!",
  detected: "bg-destructive text-destructive-foreground!",
  falsePositive: "bg-info text-info-foreground!",
  notApplicable: "bg-info text-info-foreground!",
  implemented: "bg-success text-success-foreground!",
  mitigate: "bg-success text-success-foreground!",
  markedForTransfer: "bg-info text-info-foreground!",
  rawRiskAssessmentUpdated: "bg-secondary text-secondary-foreground!",
  reopened: "bg-destructive text-destructive-foreground!",
  comment: "bg-secondary text-secondary-foreground!",
  licenseDecision: "bg-warning text-warning-foreground!",
  attachedComplianceComponent: "bg-success text-success-foreground!",
  removedComplianceComponent: "bg-secondary text-secondary-foreground!",
  published: "bg-info text-info-foreground!",
  withdrawn: "bg-destructive text-destructive-foreground!",
  created: "bg-success text-success-foreground!",
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
    const fullName = getUserFullName(currentUser as unknown as User);
    return {
      displayName: "You",
      avatarUrl: currentUser.traits?.picture,
      realName: fullName || currentUser.traits?.email || "You",
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

// The diagram plots only the day and the cvePurl* buckets, so that is all this
// sums up - the per-day rows come from different risk history DTOs.
export const reduceRiskHistories = (
  histories: RiskHistoryPoint[][],
): RiskHistoryPoint[] => {
  return histories.map((dayHistories) => {
    return dayHistories.reduce(
      (acc, curr) => {
        acc.cvePurlLow += curr.cvePurlLow;
        acc.cvePurlMedium += curr.cvePurlMedium;
        acc.cvePurlHigh += curr.cvePurlHigh;
        acc.cvePurlCritical += curr.cvePurlCritical;
        acc.cvePurlFixableLow += curr.cvePurlFixableLow ?? 0;
        acc.cvePurlFixableMedium += curr.cvePurlFixableMedium ?? 0;
        acc.cvePurlFixableHigh += curr.cvePurlFixableHigh ?? 0;
        acc.cvePurlFixableCritical += curr.cvePurlFixableCritical ?? 0;
        acc.cvePurlLowCvss += curr.cvePurlLowCvss;
        acc.cvePurlMediumCvss += curr.cvePurlMediumCvss;
        acc.cvePurlHighCvss += curr.cvePurlHighCvss;
        acc.cvePurlCriticalCvss += curr.cvePurlCriticalCvss;
        acc.cvePurlFixableLowCvss += curr.cvePurlFixableLowCvss ?? 0;
        acc.cvePurlFixableMediumCvss += curr.cvePurlFixableMediumCvss ?? 0;
        acc.cvePurlFixableHighCvss += curr.cvePurlFixableHighCvss ?? 0;
        acc.cvePurlFixableCriticalCvss += curr.cvePurlFixableCriticalCvss ?? 0;
        return acc;
      },
      {
        day: dayHistories[0]?.day ?? "",
        cvePurlLow: 0,
        cvePurlMedium: 0,
        cvePurlHigh: 0,
        cvePurlCritical: 0,
        cvePurlFixableLow: 0,
        cvePurlFixableMedium: 0,
        cvePurlFixableHigh: 0,
        cvePurlFixableCritical: 0,
        cvePurlLowCvss: 0,
        cvePurlMediumCvss: 0,
        cvePurlHighCvss: 0,
        cvePurlCriticalCvss: 0,
        cvePurlFixableLowCvss: 0,
        cvePurlFixableMediumCvss: 0,
        cvePurlFixableHighCvss: 0,
        cvePurlFixableCriticalCvss: 0,
      } as RiskHistoryPoint,
    );
  });
};

export const generateNewSecret = (): string => {
  return crypto.randomUUID();
};

import type { ContentTreeElement } from "@/types/view/context";

export const normalizeContentTree = (
  contentTree: Array<ContentTreeElement>,
) => {
  const assetMap: {
    [key: string]:
      | (ContentTreeElement["assets"][number] & {
          project: Omit<ContentTreeElement, "assets">;
        })
      | undefined;
  } = {};

  contentTree.forEach((element) => {
    const { assets: _assets, ...project } = element;
    element.assets.forEach((asset) => {
      assetMap[asset.id] = {
        ...asset,
        project,
      };
    });
  });

  return assetMap;
};

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
