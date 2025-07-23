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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { classNames } from "@/utils/common";
import GradientText from "@/components/misc/GradientText";

export default function NotSupported() {
  return (
    <div className="text-center">
      <div className="flex flex-col min-h-screen justify-center items-center">
        <Image
          src="/assets/nosupport-gopher.png"
          alt="sad"
          width={50}
          height={50}
          className="m-8"
        />
        <div className="mx-4">
          <Card className="">
            <CardHeader>
              <CardTitle>
                <GradientText
                  colors={[
                    "#FEFDF8",
                    "#FDE9B5",
                    "#FDD36F",
                    "#FDDA83",
                    "#FCBF29",
                  ]}
                  animationSpeed={1}
                >
                  No Mobile Support for Devguard
                </GradientText>
              </CardTitle>
              <CardDescription>
                We are not sure if DevGuard on Mobile makes sense - if you are
                interested in DevGuard Mobile Support give us a heads up on our
                GitHub.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex w-full flex-row justify-between space-x-4">
                <a
                  className={classNames(
                    "!text-black flex-1",
                    buttonVariants({ variant: "default" }),
                  )}
                  href="https://devguard.org"
                >
                  <Image
                    src="/logo_icon.svg"
                    alt="DevGuard Logo"
                    width={24}
                    height={24}
                    className=" mr-2"
                  />
                  Devguard
                </a>
                <a
                  className={classNames(
                    "flex-1",
                    buttonVariants({ variant: "secondary" }),
                  )}
                  href="https://github.com/l3montree-dev/devguard"
                >
                  <Image
                    src="/assets/github.svg"
                    alt="GitHub Logo"
                    className="mr-2 dark:invert"
                    width={24}
                    height={24}
                  />
                  GitHub
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
