// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

// Copyright (C) 2026 Tim Bastin, l3montree GmbH
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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import type { InstanceSettings } from "@/types/dto";
import { getServerClientInAppRouter } from "../services/devGuardApiAppRouter";

export async function fetchInstanceSettings(): Promise<
  Partial<InstanceSettings>
> {
  const client = await getServerClientInAppRouter();

  const { data, response: r } = await client.GET("/instance-settings");
  if (!r.ok) {
    return {};
  }

  return data ?? {};
}
