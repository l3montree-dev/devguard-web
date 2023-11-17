// Copyright (C) 2023 Sebastian Kawelke, l3montree UG (haftungsbeschraenkt)
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

import { IActivityItem } from "@/types/common";

export function calculateActivityString(item: IActivityItem): JSX.Element {
  switch (item.newState) {
    case "verifiedFix":
      return (
        <p className="text-sm text-blue-100">
          <span className="font-mono text-blue-100">{item.cve}</span> in{" "}
          <span className="font-mono text-blue-100">{item.projectName}</span>{" "}
          mitigated through{" "}
          <span className="font-mono text-green-400">verified-fix</span>.
        </p>
      );
    case "pendingFix":
      return (
        <p className="text-sm text-blue-100">
          <span className="font-mono text-blue-100">{item.cve}</span> in{" "}
          <span className="font-mono text-blue-100">{item.projectName}</span>{" "}
          now mitigated through{" "}
          <span className="font-montext-yellow-400">pending-fix</span>.
        </p>
      );
    default:
      return (
        <p className="text-sm">
          <span className="font-mono text-red-400">Error</span>
        </p>
      );
  }
}
