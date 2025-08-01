// Copyright 2024 Tim Bastin, l3montree GmbH
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

import { allowedActionsCheck, classNames } from "@/utils/common";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { FunctionComponent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/types/api/api";

interface Props {
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string;
  }>;
  onRemoveMember: (id: string) => void;
  onChangeMemberRole: (
    id: string,
    role: UserRole.Admin | UserRole.Member,
  ) => void;
}
const MembersTable: FunctionComponent<Props> = ({
  members,
  onRemoveMember,
  onChangeMemberRole,
}) => {
  const currentUser = useCurrentUser();
  const currentUserRole = useCurrentUserRole();

  return (
    <div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className={classNames("w-full text-left", "border-b bg-card")}>
            <tr className="">
              <th className="p-4">Avatar</th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members
              .filter(
                (m) =>
                  !(m.id.startsWith("gitlab") || m.id.startsWith("github")),
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
                      <Badge variant={"outline"}>{m.role || "External"}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      {currentUser?.id === m.id ||
                      !allowedActionsCheck(currentUserRole, m.role) ? (
                        <span className="text-muted-foreground">
                          No actions
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={buttonVariants({
                              variant: "outline",
                              size: "icon",
                            })}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {m.role === UserRole.Member && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeMemberRole(m.id, UserRole.Admin)
                                }
                              >
                                Make admin
                              </DropdownMenuItem>
                            )}

                            {m.role === UserRole.Admin && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeMemberRole(m.id, UserRole.Member)
                                }
                              >
                                Make member
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onRemoveMember(m.id)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">
          External members don&apos;t have any access to the projects, but can
          be used to track comments from external sources.
        </span>
      </div>
    </div>
  );
};

export default MembersTable;
