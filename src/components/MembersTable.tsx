// Copyright 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
// limitations under the License.

import { classNames } from "@/utils/common";
import React, { FunctionComponent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface Props {
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  }>;
}
const MembersTable: FunctionComponent<Props> = ({ members }) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className={classNames("w-full text-left", "border-b bg-card")}>
          <tr className="">
            <th className="p-4">Avatar</th>
            <th className="p-4">Name</th>
            <th className="p-4">Role</th>
          </tr>
        </thead>
        <tbody>
          {members
            .filter(
              (m) => !(m.id.startsWith("gitlab") || m.id.startsWith("github")),
            )
            .map((m, i, arr) => {
              return (
                <tr
                  className={classNames(
                    i % 2 !== 0 && "bg-card/75",
                    i + 1 !== arr.length && "border-b",
                  )}
                  key={m.id}
                >
                  <td className="p-4">
                    <Avatar>
                      {Boolean(m?.avatarUrl) && (
                        <AvatarImage src={m?.avatarUrl} alt={m.name} />
                      )}
                      <AvatarFallback className="bg-secondary">
                        {m.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="p-4">{m.name}</td>
                  <td className="p-4 capitalize">
                    <Badge variant={"outline"}>{m.role}</Badge>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default MembersTable;
