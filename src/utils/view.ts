// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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

import { AssetDTO, OrganizationDetailsDTO, ProjectDTO } from "@/types/api/api";
import { Identity } from "@ory/client";

export const osiLicenseColors: Record<string, string> = {
  MIT: "bg-green-500",
  "Apache-2.0": "bg-blue-500",
  "GPL-3.0": "bg-red-500",
  "GPL-2.0": "bg-orange-500",
  "BSD-2-Clause": "bg-yellow-500",
  "BSD-3-Clause": "bg-yellow-500",
  "LGPL-3.0": "bg-purple-500",
  "AGPL-3.0": "bg-pink-500",
  "EPL-2.0": "bg-indigo-500",
  "MPL-2.0": "bg-teal-500",
  unknown: "bg-gray-500",
  "CC0-1.0": "bg-gray-600",
};

export const osiLicenseHexColors: Record<string, string> = {
  MIT: "#28a745",
  "Apache-2.0": "#007bff",
  "GPL-3.0": "#dc3545",
  "GPL-2.0": "#fd7e14",
  "BSD-2-Clause": "#ffc107",
  "BSD-3-Clause": "#ffc107",
  "LGPL-3.0": "#6f42c1",
  "AGPL-3.0": "#d63384",
  "EPL-2.0": "#6610f2",
  "MPL-2.0": "#20c997",
  unknown: "#6c757d",
  "CC0-1.0": "#343a40",
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

export const getRepositoryId = (asset?: AssetDTO, project?: ProjectDTO) => {
  if (asset && asset.repositoryId) {
    return asset.repositoryId;
  }
  return getParentRepositoryIdAndName(project).parentRepositoryId;
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

const colors1 = [
  "#fbbd25",
  "#ff9b37",
  "#ff7755",
  "#ff5578",
  "#ff409d",
  "#e044c0",
  "#a154dc",
  "#2563eb",
];

// Generate HSL color
export const generateColor = (str: string) => {
  const hash = Math.abs(hashCode(str));

  return colors[hash % colors.length];
};
