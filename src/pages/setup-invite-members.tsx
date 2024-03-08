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

import Alert from "@/components/Alert";
import AlreadyInvitedMembersList from "@/components/AlreadyInvitedMembersList";
import InviteMembersForm from "@/components/InviteMembersForm";
import Page from "@/components/Page";
import { IMember } from "@/types/common";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "../components/Toaster";

const navigation = [
  { name: "Projects", href: "#", icon: ServerIcon, current: true },
  { name: "Latest Activity", href: "#", icon: SignalIcon, current: false },
  { name: "Domains", href: "#", icon: GlobeAltIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarSquareIcon, current: false },
  { name: "Settings", href: "#", icon: Cog6ToothIcon, current: false },
];

export default function SetupInviteMembers() {
  const [invitedMembers, setinvitedMembers] = useState<IMember[]>([]);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const setNewMember = (member: IMember) => {
    toast({
      msg: "Member invited",
      title: "Member invited",
      intent: "success",
    });
    // Check if member is already invited
    if (invitedMembers.find((m) => m.email === member.email)) {
      setShowAlert(true);
      return;
    }
    setinvitedMembers((prev) => [...prev, member]);
  };

  return (
    <Page title="Invite Team Members">
      {showAlert && (
        <Alert
          alertType={"warning"}
          title="The member is already invited."
          show={showAlert}
          setShow={setShowAlert}
        />
      )}
      <div className="py-2 mt-8">
        <InviteMembersForm inviteMembers={setNewMember} />
      </div>
      <div className="py-2 mt-8">
        <AlreadyInvitedMembersList members={invitedMembers} />
      </div>
    </Page>
  );
}
