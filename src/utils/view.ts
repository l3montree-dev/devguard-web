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

  return colors1[hash % colors1.length];
};
