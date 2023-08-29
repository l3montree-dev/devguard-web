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
import Input from "./common/Input";
import Button from "./common/Button";

interface Props {
  inviteMembers: (member: IMember) => void;
}

export default function InviteMembersForm({ inviteMembers }: Props) {
  const handleSubmit = (event: any) => {
    event.preventDefault();
    const member = {
      email: event.target.email.value as string,
    };
    if (
      member.email === "" ||
      member.email === null ||
      member.email === undefined
    ) {
      return;
    }
    inviteMembers(member);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="mt-2 text-base font-semibold leading-6 text-white">
            Invite team members
          </h2>
          <p className="mt-1 text-sm text-blue-200">
            You haven’t added any team members to your project yet. As the owner
            of this project, you can manage team member permissions.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 items-end gap-2 flex">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>

          <div className="w-full flex-1">
            <Input
              label="Email address"
              type="email"
              name="email"
              placeholder="Enter an email"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit">Send invite</Button>
        </form>
      </div>
    </div>
  );
}
