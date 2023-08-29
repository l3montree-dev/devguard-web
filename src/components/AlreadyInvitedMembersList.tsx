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

import { IMember } from "@/types/common";
import { CheckIcon } from "@heroicons/react/24/outline";

interface Props {
  members: IMember[];
}

export default function AlreadyInvitedMembersList({ members }: Props) {
  return (
    <div className="">
      <h3 className="text-sm font-medium text-blue-200">
        Team members already added
      </h3>
      <ul
        role="list"
        className="mt-4 divide-y divide-gray-700 border-b border-t border-gray-700"
      >
        {members.map((member, personIdx) => (
          <li
            key={personIdx}
            className="flex items-center justify-between space-x-3 py-4"
          >
            <div className="flex min-w-0 flex-1 items-center space-x-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-300">
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 space-x-4">
              <p className="text-sm text-gray-300">Invitation sent</p>
              <CheckIcon className="h-5 w-5 text-green-500" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
