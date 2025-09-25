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
"use client";
import Lanyard from "@/components/misc/Lanyard";
import OrgRegisterForm from "@/components/OrgRegister";
import Page from "@/components/Page";
import { useSession } from "../../context/SessionContext";
import { redirect } from "next/navigation";

export default function SetupOrg() {
  const session = useSession();
  if (session.session === null) {
    redirect("/login");
  }
  return (
    <Page title="Setup Your Organization">
      <div className="">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="">
            <div className="absolute inset-0 z-10 -top-10 w-1/2">
              <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
            </div>
          </div>
          <div className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              <h2 className="text-3xl font-bold text-foreground">
                Create your VIP-Area in the
                <br />
                DevGuard Universe
              </h2>
              <OrgRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
