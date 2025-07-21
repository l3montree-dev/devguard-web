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

import OrgRegisterForm from "@/components/OrgRegister";
import Page from "@/components/Page";
import { middleware } from "@/decorators/middleware";
import { withOrgs } from "@/decorators/withOrgs";
import { withSession } from "../decorators/withSession";
import Lanyard from "@/components/misc/Lanyard";
import Image from "next/image";
import GradientText from "@/components/misc/GradientText";

export default function NotSupported(props: any) {
  return (
    <div>
      <div className="text-center">
        <div className="flex flex-col min-h-screen justify-center items-center">
          <Image
            src="/logo_inverse_icon.svg"
            alt="DevGuard Logo"
            width={80}
            height={80}
          />
          <div>
            <GradientText
              colors={["#FEFDF8", "#FDE9B5", "#FDD36F", "#FDDA83", "#FCBF29"]}
              animationSpeed={5}
              className=""
            >
              No Mobile Support for Devguard yet
            </GradientText>
          </div>
        </div>
        <div>
          <Image
            src="/nosupport-gopher.png"
            alt="sad"
            width={50}
            height={50}
          ></Image>
        </div>
      </div>
    </div>
  );
}
