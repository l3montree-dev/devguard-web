// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { classNames } from "@/utils/common";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { FunctionComponent } from "react";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { InvitationStatus } from "@/types/view/invitation";
import { Badge } from "./ui/badge";

interface Props {
  members: Array<{
    id: string;
    email: string;
    expiryDate: string;
    invitationStatus: string;
  }>;
  onRevokeInvitation: (id: string) => void;
}
const InvitedMembersTable: FunctionComponent<Props> = ({
  members,
  onRevokeInvitation,
}) => {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <table className="w-full text-sm">
          <thead className={classNames("w-full text-left", "border-b bg-card")}>
            <tr className="">
              <th className="p-4">E-Mail</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expires at</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((m, i, arr) => {
              return (
                <tr
                  className={classNames(
                    i % 2 !== 0 && "bg-card/75",
                    i + 1 !== arr.length && "border-b",
                  )}
                  key={m.id}
                >
                  <td className="p-4">{m.email}</td>
                  <td className="p-4 capitalize">
                    <Badge variant={"outline"}>
                      {m.invitationStatus || InvitationStatus.Pending}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {new Date(m.expiryDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid="change-user-role"
                        className={buttonVariants({
                          variant: "outline",
                          size: "icon",
                        })}
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => onRevokeInvitation(m.id)}
                        >
                          {m.invitationStatus == InvitationStatus.Expired
                            ? "Remove"
                            : "Revoke"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvitedMembersTable;
