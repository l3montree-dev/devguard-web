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
import { Handle, Position } from "reactflow";
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
  sourceHandle,
  targetHandle,
  onButtonClick,
  comingSoon,
}: {
  title: string;
  description: string;
  sourceHandle?: boolean;
  targetHandle?: boolean;
  comingSoon?: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <Card
      className={classNames(
        "w-72",
        comingSoon ? "" : "scale-105 ring ring-blue-600",
      )}
    >
      {targetHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="target"
          id="left"
          position={Position.Left}
        />
      )}
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter>
        <Button
          className="flex-1"
          disabled={comingSoon}
          variant={comingSoon ? "outline" : "default"}
          onClick={onButtonClick}
        >
          {comingSoon ? "Coming soon" : "Open Instructions"}
        </Button>
      </CardFooter>

      {sourceHandle && (
        <Handle
          className="!border-2 border-white !bg-gray-400 p-1"
          type="source"
          id="right"
          position={Position.Right}
        />
      )}
    </Card>
  );
}

export default Stage;
