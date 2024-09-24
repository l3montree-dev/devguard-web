// Copyright (C) 2024 Tim Bastin, l3montree UG (haftungsbeschränkt)
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { classNames } from "@/utils/common";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

function Stage({
  title,
  description,
  onButtonClick,
  comingSoon,
  LastScan,
}: {
  title: string;
  description: string;
  comingSoon?: boolean;
  onButtonClick?: () => void;
  LastScan?: ReactNode;
}) {
  return (
    <Card className="h-full">
      <div
        className={classNames(
          Boolean(LastScan) && "animated-outline relative rounded-lg",
        )}
      >
        <div className="rounded-lg bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex flex-row items-center gap-2">{title}</div>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full flex-1"
              disabled={comingSoon}
              variant={comingSoon ? "outline" : "default"}
              onClick={onButtonClick}
            >
              {comingSoon ? "Coming soon" : "Open Instructions"}
            </Button>
            {Boolean(LastScan) && LastScan}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

export default Stage;
