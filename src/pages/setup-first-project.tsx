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

import GroupAndProjectsForm from "@/components/GroupAndProjectsForm";
import Page from "@/components/Page";
import ProgressSidebar from "@/components/ProgressSidebar";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Projects", href: "#", icon: ServerIcon, current: true },
  { name: "Latest Activity", href: "#", icon: SignalIcon, current: false },
  { name: "Domains", href: "#", icon: GlobeAltIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarSquareIcon, current: false },
  { name: "Settings", href: "#", icon: Cog6ToothIcon, current: false },
];

export default function SetupFirstProject() {
  return (
    <Page
      title="Create your First Projects"
      navigation={navigation}
      menuActive={false}
      searchActive={false}
    >
      <div className="px-8 py-2 sm:px-6 lg:px-14">
        <GroupAndProjectsForm />
      </div>
      <div className="xl:pl-72">
        <ProgressSidebar
          steps={[
            {
              name: "Create account",
              status: "complete",
            },
            {
              name: "Create your organization",
              status: "complete",
            },
            {
              name: "Create first projects",
              status: "current",
            },
            {
              name: "Invite team members",
              status: "upcoming",
            },
          ]}
        />
      </div>
    </Page>
  );
}
