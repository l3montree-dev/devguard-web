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

import { OrganizationDetailsDTO } from "@/types/api/api";
import { Identity } from "@ory/client";

export const defaultScanner =
  "github.com/l3montree-dev/devguard/cmd/devguard-scanner/";
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
export const findUser = (
  id: string,
  org: OrganizationDetailsDTO,
  currentUser: Identity,
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
