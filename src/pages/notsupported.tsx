// Copyright (C) 2023 Lars Hermges, l3montree GMBH
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

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotSupported() {
  return (
    <div className="text-center">
      <div className="flex flex-col min-h-screen justify-center items-center max-w-">
        <Image
          src="/assets/nosupport-gopher.png"
          alt="sad"
          width={50}
          height={50}
          className="m-8"
        />
        <div className="">
          <div className="max-w-80 ">
            <div className="text-xl mb-4">No Mobile Support for Devguard</div>
            <div className=" flex flex-row justify-content justify-between justify-center space-x-4">
              <div className="">
                <a href="https://devguard.org">
                  <Button variant={"default"} className="text-xl">
                    <Image
                      src="/logo_icon.svg"
                      alt="DevGuard Logo"
                      width={30}
                      height={30}
                      className=" mr-2"
                    />
                    Documentation
                  </Button>
                </a>
              </div>
              <div className="">
                <a href="https://github.com/l3montree-dev/devguard">
                  <Button variant={"secondary"} className="text-xl">
                    <Image
                      src="/assets/github.svg"
                      alt="GitHub Logo"
                      className="mr-2 dark:invert"
                      width={30}
                      height={30}
                    />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
